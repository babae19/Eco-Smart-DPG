
import React, { useState } from 'react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CampaignHeaderProps {
  imageUrl: string;
  images?: string[];
  title: string;
}

export const CampaignHeader = React.memo(({ imageUrl, images = [], title }: CampaignHeaderProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const placeholderImage = '/placeholder.svg';
  const allImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : [placeholderImage]);
  const actualImageSource = allImages[currentIndex] || placeholderImage;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setImageLoaded(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setImageLoaded(false);
  };
  
  return (
    <>
      <div className="relative">
        <div className="h-96 w-full overflow-hidden bg-muted cursor-pointer group" onClick={() => setLightboxOpen(true)}>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="w-12 h-12 rounded-full border-4 border-t-primary border-border animate-spin"></div>
            </div>
          )}
          <img 
            src={imageError ? placeholderImage : actualImageSource}
            alt={title} 
            className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          
          {/* Navigation arrows for multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                      setImageLoaded(false);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{title}</h1>
        </div>
      </div>

      <ImageLightbox
        images={allImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentIndex}
        title={title}
      />
    </>
  );
});

// Display name for React DevTools
CampaignHeader.displayName = 'CampaignHeader';
