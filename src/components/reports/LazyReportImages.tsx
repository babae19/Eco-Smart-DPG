import React, { useState, useEffect, useCallback } from 'react';
import { getReportImages } from '@/services/reports/reportFetchService';

interface LazyReportImagesProps {
  reportId: string;
  className?: string;
}

const LazyReportImages: React.FC<LazyReportImagesProps> = ({ 
  reportId, 
  className = "" 
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const loadImages = useCallback(async () => {
    if (hasLoaded || isLoading) return;
    
    setIsLoading(true);
    try {
      const reportImages = await getReportImages(reportId);
      setImages(reportImages);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reportId, hasLoaded, isLoading]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            loadImages();
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`report-images-${reportId}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [reportId, loadImages, hasLoaded]);

  if (!isVisible && !hasLoaded) {
    return (
      <div 
        id={`report-images-${reportId}`}
        className={`h-32 bg-muted rounded-md ${className}`}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={`h-32 bg-muted rounded-md animate-pulse ${className}`} />
    );
  }

  if (!images.length) {
    return null;
  }

  return (
    <div id={`report-images-${reportId}`} className={className}>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Report image ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
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
};

export default LazyReportImages;