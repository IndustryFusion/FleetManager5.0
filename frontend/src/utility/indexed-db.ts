// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//


import axios from 'axios';

const FLEET_MANAGER_BACKEND_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

interface LoginData {
    ifricdi: string;
    // The masked refresh token minted alongside ifricdi at login. Optional so
    // a session stored before refresh support still type-checks, and because
    // an SSO-arrived session has no refresh token at all.
    ifricdr?: string;
    company_ifric_id: string;
    user_name: string;
    jwt_token: string;
    user_role: string;
    access_group: string;
    access_group_Ifric_Dashboard: string;
    user_email: string;
    from?: string;
}

interface AccessGroupData extends Omit<LoginData, 'jwt_token'> {
    id: string;
    jwt_token: string; 
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("myDatabase");

        request.onupgradeneeded = function (event) {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("accessGroupStore")) {
                db.createObjectStore("accessGroupStore", { keyPath: "id" });
            }
        };

        request.onsuccess = function (event) {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onerror = function (event) {
            reject("Database error: " + (event.target as IDBOpenDBRequest).error);
        };
    });
}

async function ensureObjectStore(db: IDBDatabase, storeName: string): Promise<void> {
    if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(db.name, db.version + 1);
            request.onupgradeneeded = function (event) {
                const upgradedDb = (event.target as IDBOpenDBRequest).result;
                if (!upgradedDb.objectStoreNames.contains(storeName)) {
                    upgradedDb.createObjectStore(storeName, { keyPath: "id" });
                }
            };
            request.onsuccess = function (event) {
                const upgradedDb = (event.target as IDBOpenDBRequest).result;
                upgradedDb.close();
                resolve();
            };
            request.onerror = function (event) {
                reject("Error upgrading database: " + (event.target as IDBOpenDBRequest).error);
            };
        });
    }
}

export async function storeAccessGroup(loginData: LoginData) : Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        const dataToStore = {
            id: "accessGroup",
            company_ifric_id: loginData.company_ifric_id,
            user_name: loginData.user_name,
            ifricdi: loginData.ifricdi,
            ifricdr: loginData.ifricdr,
            user_role: loginData.user_role,
            access_group: loginData.access_group,
            access_group_Ifric_Dashboard: loginData.access_group_Ifric_Dashboard,
            user_email: loginData.user_email,
            ...(loginData.from !== undefined ? { from: (loginData.from) } : {})
        };

        return new Promise<void>((resolve, reject) => {
            // Read first, then merge: a payload that does not carry a field
            // must not blank it. An SSO arrival with no refresh-token handoff
            // has no ifricdr, and overwriting the stored one would leave a
            // session that cannot refresh and dies at the next expiry.
            const existing = objectStore.get("accessGroup");

            existing.onerror = function () {
                reject(new Error("Failed to read access group data"));
            };

            existing.onsuccess = function () {
                const previous =
                    (existing.result as Record<string, unknown>) ?? {};
                // Merging is only right for the same person: a different user
                // signing in must not inherit anything from the last one.
                const sameUser =
                    !previous.user_email ||
                    !dataToStore.user_email ||
                    previous.user_email === dataToStore.user_email;
                const merged = {
                    ...(sameUser ? previous : {}),
                    ...Object.fromEntries(
                        Object.entries(dataToStore).filter(
                            ([, value]) => value !== undefined,
                        ),
                    ),
                };
                const request = objectStore.put(merged);

                request.onsuccess =  function () {
                    resolve();
                };

                request.onerror = function () {
                    reject(new Error("Failed to store access group data"));
                };
            };
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export async function getAccessGroup(): Promise<AccessGroupData> {
    try {
        const db = await openDatabase();
        await ensureObjectStore(db, "accessGroupStore");
        const transaction = db.transaction(["accessGroupStore"], "readonly");
        const objectStore = transaction.objectStore("accessGroupStore");

        return new Promise((resolve, reject) => {
            const request = objectStore.get("accessGroup");
            request.onsuccess = async () => {
                const result = request.result as AccessGroupData;
                resolve(result);
            };
            request.onerror = function (event) {
                console.error("Error retrieving access group data: " + (event.target as IDBRequest).error);
                reject(new Error("Failed to retrieve access group data"));
            };
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Writes a refreshed access/refresh token pair in a single transaction.
 *
 * Deliberately not two updateAccessGroupField calls: those are separate
 * read-modify-write cycles, and a failure between them would leave an ifricdi
 * from one refresh beside an ifricdr from another. Keycloak rotates refresh
 * tokens, so a torn pair is unrecoverable — the next refresh would present a
 * refresh token that has already been spent.
 */
export async function storeTokenPair(ifricdi: string, ifricdr: string): Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        const request = objectStore.get("accessGroup");

        return new Promise<void>((resolve, reject) => {
            request.onsuccess = function () {
                const data = request.result;

                if (!data) {
                    reject(new Error("No data found to update"));
                    return;
                }

                data.ifricdi = ifricdi;
                data.ifricdr = ifricdr;

                const updateRequest = objectStore.put(data);

                updateRequest.onsuccess = function () {
                    resolve();
                };

                updateRequest.onerror = function () {
                    reject(new Error("Failed to store refreshed token pair"));
                };
            };

            request.onerror = function () {
                reject(new Error("Failed to retrieve access group data"));
            };
        });
    } catch (error) {
        throw error;
    }
}

export async function updateAccessGroupField(fieldName: string, fieldValue: any) : Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        // Get the existing object
        const request = objectStore.get("accessGroup");

        return new Promise<void>((resolve, reject) => {
            request.onsuccess = function (event) {
                const data = request.result;

                if (!data) {
                    reject(new Error("No data found to update"));
                    return;
                }

                // Update the specific field
                data[fieldName] = fieldValue;

                // Save the updated object back to IndexedDB
                const updateRequest = objectStore.put(data);

                updateRequest.onsuccess = function () {
                    console.log("Access group data updated successfully");
                    resolve();
                };

                updateRequest.onerror = function (event) {
                    console.error("Error updating access group data: " + (event.target as IDBRequest).error);
                    reject(new Error("Failed to update access group data"));
                };
            };

            request.onerror = function (event) {
                console.error("Error retrieving access group data: " + (event.target as IDBRequest).error);
                reject(new Error("Failed to retrieve access group data"));
            };
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAccessGroupData = async(token: string) => {
    try {
        const registryHeader = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await axios.post(`${FLEET_MANAGER_BACKEND_URL}/auth/decrypt-route`, {token, product_name: "Fleet Manager"}, {
            headers: registryHeader
        });
        await storeAccessGroup(response.data.data);
        return { status: 200, message: "stored data successfully"}
    } catch(error: any) {
        throw error;
    }
}
export const clearIndexedDbOnLogout = async () => {
    try {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open("myDatabase");
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");
        await objectStore.clear();
        db.close();
    } catch (error) {
        console.error("Error clearing IndexedDB:", error);
    }
};