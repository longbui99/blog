// Utility functions for LocalStorage and IndexedDB

const dbName = 'SidebarDB';
const storeName = 'MenuItems';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id' });
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

export const setItem = async (key, value) => {
    if (window.indexedDB) {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put({ id: key, value });
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getItem = async (key) => {
    if (window.indexedDB) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = (event) => {
                resolve(event.target.result ? event.target.result.value : null);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }
};

export const removeItem = async (key) => {
    if (window.indexedDB) {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(key);
    } else {
        localStorage.removeItem(key);
    }
}; 