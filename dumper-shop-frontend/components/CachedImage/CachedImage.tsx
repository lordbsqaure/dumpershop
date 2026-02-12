'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Image, ImageProps } from '@mantine/core';
import { useImageCache } from '../../lib/imageCache';

interface CachedImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null | undefined;
  fallback?: string;
  alt?: string;
}

/**
 * CachedImage component that automatically caches images using IndexedDB
 * Images are stored persistently on the device for faster loading
 */
export const CachedImage = memo(function CachedImage({
  src,
  fallback = 'https://via.placeholder.com/400x300?text=No+Image',
  alt = 'Product image',
  ...props
}: CachedImageProps) {
  const { getCachedImage } = useImageCache();
  const [cachedSrc, setCachedSrc] = useState<string>(src || fallback);
  const loadingRef = useRef(false);
  const currentSrcRef = useRef(src);

  useEffect(() => {
    // Skip if already loading or if src hasn't changed
    if (loadingRef.current || currentSrcRef.current === src) {
      return;
    }

    currentSrcRef.current = src;
    loadingRef.current = true;

    const loadImage = async () => {
      try {
        if (src) {
          const cached = await getCachedImage(src);
          setCachedSrc(cached);
        } else {
          setCachedSrc(fallback);
        }
      } catch (error) {
        console.error('Failed to load cached image:', error);
        setCachedSrc(src || fallback);
      } finally {
        loadingRef.current = false;
      }
    };

    loadImage();
  }, [src, fallback, getCachedImage]);

  return (
    <Image
      {...props}
      src={cachedSrc}
      alt={alt}
      onError={() => {
        if (cachedSrc !== fallback) {
          setCachedSrc(fallback);
        }
      }}
    />
  );
});
