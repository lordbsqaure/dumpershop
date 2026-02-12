// React hook for using image cache
import { useCallback } from 'react';

/**
 * Persistent Image Cache using IndexedDB
 * Stores images locally on the device for faster loading
 */

const DB_NAME = 'ImageCacheDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
}

class PersistentImageCache {
  private static instance: PersistentImageCache;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private memoryCache: Map<string, string> = new Map(); // Object URLs for quick access

  private constructor() {
    this.initPromise = this.initDB();
  }

  static getInstance(): PersistentImageCache {
    if (!PersistentImageCache.instance) {
      PersistentImageCache.instance = new PersistentImageCache();
    }
    return PersistentImageCache.instance;
  }

  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available, image caching disabled');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    return this.db;
  }

  /**
   * Check if URL is external (not from same origin)
   */
  private isExternalUrl(url: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Get proxied URL for external images
   */
  private getProxiedUrl(url: string): string {
    if (!this.isExternalUrl(url)) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  /**
   * Get cached image or fetch and cache it
   */
  async getCachedImage(url: string): Promise<string> {
    if (!url) return url;

    // Check memory cache first (fastest)
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url)!;
    }

    // Use proxied URL for external images to avoid CORS
    const fetchUrl = this.getProxiedUrl(url);

    try {
      // Check IndexedDB cache
      const cachedBlob = await this.getFromDB(url);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      }

      // Not in cache, try to fetch and store
      try {
        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Store in IndexedDB with original URL as key
        await this.saveToDB(url, blob);

        // Create object URL and store in memory cache
        const objectUrl = URL.createObjectURL(blob);
        this.memoryCache.set(url, objectUrl);

        return objectUrl;
      } catch (fetchError) {
        // If fetch fails, return the proxied URL for direct browser loading
        console.warn('Cannot cache image, using proxied URL:', url);
        return fetchUrl;
      }
    } catch (error) {
      console.error('Failed to process image:', url, error);
      // Return original URL if caching fails
      return url;
    }
  }

  private async getFromDB(url: string): Promise<Blob | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result as CachedImage | undefined;
          resolve(result?.blob || null);
        };

        request.onerror = () => {
          console.error('Failed to get image from cache:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      return null;
    }
  }

  private async saveToDB(url: string, blob: Blob): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const cachedImage: CachedImage = {
          url,
          blob,
          timestamp: Date.now(),
        };

        const request = store.put(cachedImage);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Failed to save image to cache:', request.error);
          resolve(); // Don't reject, just log the error
        };
      });
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.memoryCache.clear();

    // Clear IndexedDB
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Failed to clear cache:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Remove old cached images (older than specified days)
   */
  async clearOldCache(daysOld: number = 30): Promise<void> {
    try {
      const db = await this.ensureDB();
      const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const cachedImage = cursor.value as CachedImage;
            if (cachedImage.timestamp < cutoffTime) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('Failed to clear old cache:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  }

  /**
   * Preload images into cache
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map((url) => this.getCachedImage(url));
    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const imageCache = PersistentImageCache.getInstance();

export function useImageCache() {
  const getCachedImage = useCallback((url: string) => {
    return imageCache.getCachedImage(url);
  }, []);

  const clearCache = useCallback(() => {
    return imageCache.clearCache();
  }, []);

  const clearOldCache = useCallback((days?: number) => {
    return imageCache.clearOldCache(days);
  }, []);

  const preloadImages = useCallback((urls: string[]) => {
    return imageCache.preloadImages(urls);
  }, []);

  return {
    getCachedImage,
    clearCache,
    clearOldCache,
    preloadImages,
  };
}
