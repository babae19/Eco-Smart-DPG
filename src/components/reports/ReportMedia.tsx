
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';

interface ReportMediaProps {
  images: string[];
  title: string;
}

export const ReportMedia: React.FC<ReportMediaProps> = ({ images, title }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = () => {
    if (images.length > 0) {
      setCurrentIndex(0);
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <div className="relative">
        {images.length > 0 ? (
          <div 
            className="w-full h-48 overflow-hidden cursor-pointer group"
            onClick={handleImageClick}
          >
            <img 
              src={images[0]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <Camera size={32} className="text-muted-foreground" />
          </div>
        )}
      </div>

      <ImageLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentIndex}
        title={title}
      />
    </>
  );
};
