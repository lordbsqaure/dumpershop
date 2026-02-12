import { useState } from 'react';

// Image cache hook for client-side image caching
export const useImageCache = () => {
  const [cache] = useState(() => new Map<string, string>());

  const getCachedImage = async (url: string): Promise<string> => {
    // Check if image is already cached
    if (cache.has(url)) {
      return cache.get(url)!;
    }

    try {
      // Download the image
      const response = await fetch(url);
      const blob = await response.blob();

      // Create object URL for local display
      const objectUrl = URL.createObjectURL(blob);

      // Cache the object URL
      cache.set(url, objectUrl);

      return objectUrl;
    } catch (error) {
      console.error('Failed to cache image:', error);
      // Return original URL if caching fails
      return url;
    }
  };

  return { getCachedImage };
};

// Utility function for direct caching (can be used outside React components)
class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async getCachedImage(url: string): Promise<string> {
    // Check if image is already cached
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      // Download the image
      const response = await fetch(url);
      const blob = await response.blob();

      // Create object URL for local display
      const objectUrl = URL.createObjectURL(blob);

      // Cache the object URL
      this.cache.set(url, objectUrl);

      return objectUrl;
    } catch (error) {
      console.error('Failed to cache image:', error);
      // Return original URL if caching fails
      return url;
    }
  }

  // Cleanup method to revoke object URLs when needed
  clearCache() {
    this.cache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.cache.clear();
  }
}

export const imageCacheManager = ImageCacheManager.getInstance();
