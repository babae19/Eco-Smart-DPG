import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getReportImages } from '@/services/reports/reportFetchService';

interface OptimizedLazyImagesProps {
  reportId: string;
  className?: string;
  maxImages?: number;
}

const OptimizedLazyImages: React.FC<OptimizedLazyImagesProps> = React.memo(({
  reportId,
  className = "",
  maxImages = 4
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Optimized intersection observer
  useEffect(() => {
    if (!elementRef.current || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [hasLoaded]);

  // Load images when visible
  const loadImages = useCallback(async () => {
    if (isLoading || hasLoaded) return;
    
    try {
      setIsLoading(true);
      const fetchedImages = await getReportImages(reportId);
      setImages(fetchedImages.slice(0, maxImages));
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reportId, maxImages, isLoading, hasLoaded]);

  // Trigger loading when visible
  useEffect(() => {
    if (isVisible && !hasLoaded) {
      loadImages();
    }
  }, [isVisible, hasLoaded, loadImages]);

  // Placeholder while not visible
  if (!isVisible && !hasLoaded) {
    return <div ref={elementRef} className={`bg-muted animate-pulse ${className}`} />;
  }

  // Loading state
  if (isLoading) {
    return <div className={`bg-muted animate-pulse ${className}`} />;
  }

  // No images
  if (!images.length) {
    return null;
  }

  return (
    <div ref={elementRef} className={className}>
      {images.length === 1 ? (
        <img
          src={images[0]}
          alt="Report"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="grid grid-cols-2 gap-1 h-full">
          {images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative ${index > 1 ? 'col-span-1' : ''} ${
                images.length === 3 && index === 0 ? 'row-span-2' : ''
              }`}
            >
              <img
                src={image}
                alt={`Report ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    +{images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedLazyImages.displayName = 'OptimizedLazyImages';

export default OptimizedLazyImages;