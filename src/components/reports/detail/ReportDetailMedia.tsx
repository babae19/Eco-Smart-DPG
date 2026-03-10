
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';

interface ReportDetailMediaProps {
  images: string[];
  title: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const ReportDetailMedia: React.FC<ReportDetailMediaProps> = ({ 
  images,
  title,
  status
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <div className="relative">
        {images.length > 0 ? (
          <div 
            className="w-full h-56 overflow-hidden cursor-pointer group"
            onClick={() => {
              setCurrentIndex(0);
              setLightboxOpen(true);
            }}
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
            <MapPin size={32} className="text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
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
