class StorageRegistry {
    constructor() {
        this.storage = new Map();
    }

    /**
     * Updates or sets a value in the storage
     * @param {string} key - The key to store the value under
     * @param {any} value - The value to store
     * @returns {void}
     */
    update(key, value) {
        if (!key) {
            throw new Error('Key is required');
        }
        this.storage.set(key, value);
    }

    /**
     * Retrieves a value from storage by key
     * @param {string} key - The key to retrieve the value for
     * @returns {any} The stored value, or null if not found
     */
    get(key) {
        if (!key) {
            throw new Error('Key is required');
        }
        return this.storage.get(key) || null;
    }

    /**
     * Checks if a key exists in storage
     * @param {string} key - The key to check
     * @returns {boolean} True if the key exists, false otherwise
     */
    has(key) {
        return this.storage.has(key);
    }

    /**
     * Removes a value from storage
     * @param {string} key - The key to remove
     * @returns {boolean} True if the value was removed, false if it didn't exist
     */
    remove(key) {
        return this.storage.delete(key);
    }

    /**
     * Clears all values from storage
     * @returns {void}
     */
    clear() {
        this.storage.clear();
    }
}

// Create a singleton instance
const storageRegistry = new StorageRegistry();

// Freeze the instance to prevent modifications
Object.freeze(storageRegistry);

export default storageRegistry;
