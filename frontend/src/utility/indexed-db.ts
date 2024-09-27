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

export async function storeAccessGroup(loginData: any) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        const dataToStore = {
            id: "accessGroup",
            company_ifric_id: loginData.company_ifric_id,
            user_name: loginData.user_name,
            jwt_token: loginData.jwt_token,
            user_role: loginData.user_role,
            access_group_DPP: loginData.access_group_DPP,
            access_group_Ifric_Dashboard: loginData.access_group_Ifric_Dashboard,
            user_email: loginData.user_email
        };

        const request = objectStore.put(dataToStore);

        return new Promise<void>((resolve, reject) => {
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
export async function getAccessGroup(): Promise<any> {
    try {
        const db = await openDatabase();
        await ensureObjectStore(db, "accessGroupStore");
        const transaction = db.transaction(["accessGroupStore"], "readonly");
        const objectStore = transaction.objectStore("accessGroupStore");

        return new Promise((resolve, reject) => {
            const request = objectStore.get("accessGroup");
            request.onsuccess = function () {
                const result = request.result;
                if (result) {
                    resolve(result);
                } else {
                    console.error("No access group data found");
                    resolve(null);
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