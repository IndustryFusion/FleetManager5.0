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

import axios from "axios";

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

export async function storeAccessGroup(accessGroup: any) {
    try {
        const db = await openDatabase();
        await ensureObjectStore(db, "accessGroupStore");
        const transaction = db.transaction(["accessGroupStore"], "readwrite");
        const objectStore = transaction.objectStore("accessGroupStore");

        const request = objectStore.put({ id: "accessGroup", data: accessGroup });

        request.onsuccess = function () {
            console.log("Access group data stored successfully");
        };

        request.onerror = function (event) {
            console.error("Error storing access group data: " + (event.target as IDBRequest).error);
        };
    } catch (error) {
        console.error(error);
    }
}

export async function getAccessGroup(callback: (data: any) => void) {
    try {
        const db = await openDatabase();
        await ensureObjectStore(db, "accessGroupStore");
        const transaction = db.transaction(["accessGroupStore"], "readonly");
        const objectStore = transaction.objectStore("accessGroupStore");

        const request = objectStore.get("accessGroup");

        request.onsuccess = function () {
            const result = request.result;
            if (result && result.data) {
                callback(result.data);
            } else {
                console.error("No access group data found");
            }
        };

        request.onerror = function (event) {
            console.error("Error retrieving access group data: " + (event.target as IDBRequest).error);
        };
    } catch (error) {
        console.error(error);
    }
}

export async function getAccessGroupId(): Promise<string | null> {
    try {
        const db = await openDatabase();
        await ensureObjectStore(db, "accessGroupStore");
        const transaction = db.transaction(["accessGroupStore"], "readonly");
        const objectStore = transaction.objectStore("accessGroupStore");

        return new Promise((resolve, reject) => {
            const request = objectStore.get("accessGroup");
            request.onsuccess = function () {
                const result = request.result;
                if (result && result.data && result.data._id) {
                    resolve(result.data._id);
                } else {
                    console.error("No access group ID found");
                    resolve(null);
                }
            };
            request.onerror = function (event) {
                console.error("Error retrieving access group ID: " + (event.target as IDBRequest).error);
                reject(null);
            };
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const fetchAccessGroupId = async () => {
    const id = await getAccessGroupId();
    if (id) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_IFRIC_REGISTRY_BACKEND_URL}/auth/get-access-group/${id}`);
        if (response.data) {
            return response.data
        }
    } else {
        console.error("No access group ID found");
    }
}