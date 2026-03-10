
import React from 'react';
import { MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Notification } from '@/hooks/useLocationBasedNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotificationCardProps {
  notification: Notification;
  index: number;
  totalCount: number;
  onClose: () => void;
  onNext: () => void;
  hasLocation: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  index,
  totalCount,
  onClose,
  onNext,
  hasLocation
}) => {
  const isMobile = useIsMobile();
  
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'alert': return 'border-blue-200 bg-blue-50';
      case 'info': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      case 'danger': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border p-3 shadow-lg ${getNotificationStyle()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-2">
          {notification.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-gray-800`}>
              {notification.title}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-label="Close notification"
            >
              <X size={isMobile ? 14 : 16} />
            </button>
          </div>
          
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1`}>
            {notification.message}
          </p>
          
          {hasLocation && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <MapPin size={12} className="mr-1" />
              <span className={isMobile ? "text-[10px]" : "text-xs"}>Based on your current location</span>
            </div>
          )}
        </div>
      </div>
      
      {totalCount > 1 && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-1">
            {Array.from({ length: totalCount }).map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === index ? 'bg-green-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={onNext}
            className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-green-600 hover:underline`}
          >
            Next tip
          </button>
        </div>
      )}
    </div>
  );
};
