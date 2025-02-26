/**
 * IndexedDB Manager for handling database operations
 */

// Database configuration
const DB_NAME = 'AppDatabase';
const DB_VERSION = 1;
const STORES = {
  CHAT: 'chatData'
};

/**
 * Opens a connection to the IndexedDB database
 * @returns {Promise<IDBDatabase>} A promise that resolves to the database connection
 */
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.CHAT)) {
        db.createObjectStore(STORES.CHAT, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

/**
 * Chat data operations
 */
const chatStorage = {
  /**
   * Saves chat data to the database
   * @param {Object} data - The chat data to save
   * @returns {Promise<void>}
   */
  saveChat: async (data) => {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.CHAT], 'readwrite');
        const store = transaction.objectStore(STORES.CHAT);
        const request = store.put({ id: 'currentChat', ...data });
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error saving chat data:', error);
      throw error;
    }
  },
  
  /**
   * Retrieves chat data from the database
   * @returns {Promise<Object>} A promise that resolves to the chat data
   */
  getChat: async () => {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.CHAT], 'readonly');
        const store = transaction.objectStore(STORES.CHAT);
        const request = store.get('currentChat');
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error retrieving chat data:', error);
      throw error;
    }
  },
  
  /**
   * Clears chat data from the database
   * @returns {Promise<void>}
   */
  clearChat: async () => {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.CHAT], 'readwrite');
        const store = transaction.objectStore(STORES.CHAT);
        const request = store.delete('currentChat');
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error clearing chat data:', error);
      throw error;
    }
  }
};

export const indexDbManager = {
  chat: chatStorage
  // Add other storage types here as needed
};
