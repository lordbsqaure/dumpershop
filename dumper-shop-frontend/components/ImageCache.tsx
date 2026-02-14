import { getPermanentImage } from '../utils/imageStorage';

// Image cache hook for client-side image caching with permanent storage
export const useImageCache = () => {
  const getCachedImage = async (url: string): Promise<string> => {
    // Use permanent storage that persists across sessions
    return getPermanentImage(url);
  };

  return { getCachedImage };
};

// Utility function for direct caching (can be used outside React components)
class ImageCacheManager {
  private static instance: ImageCacheManager;

  private constructor() {}

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async getCachedImage(url: string): Promise<string> {
    // Use permanent storage that persists across sessions
    return getPermanentImage(url);
  }
}

export const imageCacheManager = ImageCacheManager.getInstance();
