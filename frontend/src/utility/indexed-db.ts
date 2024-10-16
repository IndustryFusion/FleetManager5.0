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

import { CompactEncrypt, compactDecrypt } from 'jose';
import { createHash } from 'crypto';

//get a consistent 256-bit key
function deriveKey(secret: string): Uint8Array {
    const hash = createHash('sha256');
    hash.update(secret);
    return new Uint8Array(hash.digest());
}
const ENCRYPTION_KEY: Uint8Array =deriveKey(process.env.NEXT_PUBLIC_JWT_SECRET);

if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set. This is a security risk.');
}

interface LoginData {
    company_ifric_id: string;
    user_name: string;
    jwt_token: string;
    user_role: string;
    access_group: string;
    access_group_Ifric_Dashboard: string;
    user_email: string;
}

interface AccessGroupData extends Omit<LoginData, 'jwt_token'> {
    id: string;
    jwt_token: string; 
}

async function encryptJWT(jwt: string) {
    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(jwt))
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .encrypt(ENCRYPTION_KEY);
    return jwe;
}

async function decryptJWT(encryptedJWT: string) {
    const { plaintext } = await compactDecrypt(encryptedJWT, ENCRYPTION_KEY);
    return new TextDecoder().decode(plaintext);
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
        const encryptedJWT = await encryptJWT(loginData.jwt_token);
        const db = await openDatabase();
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        const dataToStore = {
            id: "accessGroup",
            company_ifric_id: loginData.company_ifric_id,
            user_name: loginData.user_name,
            jwt_token: encryptedJWT,
            user_role: loginData.user_role,
            access_group: loginData.access_group,
            access_group_Ifric_Dashboard: loginData.access_group_Ifric_Dashboard,
            user_email: loginData.user_email
        };

        const request = objectStore.put(dataToStore);

        return new Promise<void>((resolve, reject) => {
            const request  = objectStore.put(dataToStore);
            request.onsuccess = function () {
                console.log("Access group data stored successfully");
                resolve();
            };

            request.onerror = function (event) {
                console.error("Error storing access group data: " + (event.target as IDBRequest).error);
                reject(new Error("Failed to store access group data"));
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
                if (result) {
                    result.jwt_token = await decryptJWT(result.jwt_token)
                    resolve(result);
                } else {
                    reject(new Error("No access group data found"));
                }
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