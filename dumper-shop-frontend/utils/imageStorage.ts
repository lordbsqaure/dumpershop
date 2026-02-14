// Permanent image storage using IndexedDB
// This provides persistent storage across browser sessions

const DB_NAME = 'DumperShopImageCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class PermanentImageStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for images with url as key
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async getStoredImage(url: string): Promise<string | null> {
    try {
      await this.init();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(url);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Convert stored blob back to object URL
            const blob = result.blob as Blob;
            const objectUrl = URL.createObjectURL(blob);
            resolve(objectUrl);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('Failed to retrieve image from cache:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error getting stored image:', error);
      return null;
    }
  }

  async storeImage(url: string, blob: Blob): Promise<void> {
    try {
      await this.init();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const imageData = {
          url,
          blob,
          timestamp: Date.now(),
        };

        const request = objectStore.put(imageData);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to store image:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error storing image:', error);
      throw error;
    }
  }

  async getOrFetchImage(url: string): Promise<string> {
    // First, check if image is already stored
    const storedImage = await this.getStoredImage(url);
    if (storedImage) {
      return storedImage;
    }

    // If not stored, fetch and store it
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Store the image permanently
      await this.storeImage(url, blob);

      // Create object URL for immediate use
      const objectUrl = URL.createObjectURL(blob);
      return objectUrl;
    } catch (error) {
      console.error('Failed to fetch and store image:', error);
      // Return original URL if fetching fails
      return url;
    }
  }

  async clearOldImages(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    // Clear images older than maxAge milliseconds (default: 30 days)
    try {
      await this.init();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const cutoffTime = Date.now() - maxAge;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const index = objectStore.index('timestamp');
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('Failed to clear old images:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error clearing old images:', error);
    }
  }

  async clearAllImages(): Promise<void> {
    try {
      await this.init();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to clear all images:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error clearing all images:', error);
    }
  }
}

// Export singleton instance
export const permanentImageStorage = new PermanentImageStorage();

// Convenience function for getting or fetching an image
export async function getPermanentImage(url: string): Promise<string> {
  return permanentImageStorage.getOrFetchImage(url);
}
