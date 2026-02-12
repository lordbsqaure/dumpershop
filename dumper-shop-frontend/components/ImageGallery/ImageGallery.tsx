'use client';

import React, { useEffect, useMemo, useState } from 'react';
// react-image-gallery provides its own styles
import 'react-image-gallery/styles/css/image-gallery.css';

import ImageGalleryLib, { ReactImageGalleryItem } from 'react-image-gallery';
import { imageCacheManager } from '../ImageCache';

export interface ImageGalleryProps {
  images: string[];
  showThumbnails?: boolean;
  lazyLoad?: boolean;
  startIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

export default function ImageGallery({
  images,
  showThumbnails = true,
  lazyLoad = true,
  startIndex = 0,
  onIndexChange,
  className,
}: ImageGalleryProps) {
  // Check if we're on mobile (you might want to use a proper hook for this)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';
  const safeImages = images.filter(Boolean);
  const [cachedImages, setCachedImages] = useState<Map<string, string>>(new Map());

  // Cache images using the ImageCache system
  useEffect(() => {
    const cacheImages = async () => {
      const newCachedImages = new Map<string, string>();
      const imgs = safeImages.length ? safeImages : [PLACEHOLDER_IMAGE];

      for (const src of imgs) {
        try {
          const cachedUrl = await imageCacheManager.getCachedImage(src);
          newCachedImages.set(src, cachedUrl);
        } catch (error) {
          // If caching fails, use original URL
          newCachedImages.set(src, src);
        }
      }

      setCachedImages(newCachedImages);
    };

    cacheImages();
  }, [images]);

  // Build items for react-image-gallery using cached URLs
  const items: ReactImageGalleryItem[] = useMemo(
    () =>
      (safeImages.length ? safeImages : [PLACEHOLDER_IMAGE]).map((src) => ({
        original: cachedImages.get(src) || src || PLACEHOLDER_IMAGE,
        thumbnail: cachedImages.get(src) || src || PLACEHOLDER_IMAGE,
      })),
    [images, cachedImages]
  );

  return (
    <div className={className}>
      {/*
        react-image-gallery provides features like thumbnails, fullscreen, play, etc.
        We disable play and fullscreen by default for a clean product view.
      */}
      {/* @ts-ignore - types are fine when using the lib but sometimes strict TS flags cause noise */}
      <ImageGalleryLib
        items={items}
        showThumbnails={showThumbnails}
        showNav={!isMobile}
        showPlayButton={false}
        showFullscreenButton={false}
        lazyLoad={lazyLoad}
        startIndex={startIndex}
        onSlide={(index: number) => onIndexChange && onIndexChange(index)}
        renderItem={(item: any) => (
          // the library wraps this in its own container; we keep things simple and ensure proper sizing
          <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            <img
              src={item?.original}
              alt={item?.originalAlt ?? ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              loading={lazyLoad ? 'lazy' : 'eager'}
            />
          </div>
        )}
        renderThumbInner={(item: any) => (
          <div
            style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <img
              src={item?.thumbnail}
              alt={item?.thumbnailAlt ?? ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
            />
          </div>
        )}
      />
    </div>
  );
}
