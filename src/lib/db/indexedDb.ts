export const DB_NAME = "kobo-reader-db";
export const STORE_NAME = "database";
export const DB_VERSION = 1;

export const openDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveDatabase = async (buffer: ArrayBuffer): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(buffer, "database");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Failed to save database to IndexedDB:", error);
    throw error;
  }
};

export const loadDatabase = async (): Promise<ArrayBuffer | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get("database");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
    });
  } catch (error) {
    console.error("Failed to load database from IndexedDB:", error);
    return null;
  }
};

export const hasStoredDatabase = async (): Promise<boolean> => {
  try {
    const buffer = await loadDatabase();
    return buffer !== null;
  } catch {
    return false;
  }
};

export const clearDatabase = async (): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete("database");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Failed to clear database from IndexedDB:", error);
    throw error;
  }
};
