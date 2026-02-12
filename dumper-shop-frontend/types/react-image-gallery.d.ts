declare module 'react-image-gallery' {
  import * as React from 'react';

  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    originalAlt?: string;
    originalTitle?: string;
    thumbnailAlt?: string;
    thumbnailTitle?: string;
    originalClass?: string;
    thumbnailClass?: string;
  }

  export interface ImageGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
    items: ReactImageGalleryItem[];
    showThumbnails?: boolean;
    showPlayButton?: boolean;
    showFullscreenButton?: boolean;
    showNav?: boolean;
    lazyLoad?: boolean;
    startIndex?: number;
    onSlide?: (index: number) => void;
    renderItem?: (item: any) => React.ReactNode;
    renderThumbInner?: (item: any) => React.ReactNode;
  }

  const ImageGallery: React.ComponentType<ImageGalleryProps>;
  export default ImageGallery;
}
