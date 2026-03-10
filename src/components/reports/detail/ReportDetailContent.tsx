
import React, { useState } from 'react';
import { ImageLightbox } from '@/components/ui/image-lightbox';

interface ReportDetailContentProps {
  description: string;
  images: string[];
}

export const ReportDetailContent: React.FC<ReportDetailContentProps> = ({ 
  description,
  images
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index + 1); // +1 because first image is shown in ReportDetailMedia
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="p-5 pt-0">
        <p className="text-gray-700 mb-6 whitespace-pre-line">{description}</p>
        
        {/* Image gallery for multiple images */}
        {images.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">More Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {images.slice(1).map((image, index) => (
                <div 
                  key={index} 
                  className="h-24 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={image} 
                    alt={`Additional image ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentIndex}
        title="Report Images"
      />
    </>
  );
};
