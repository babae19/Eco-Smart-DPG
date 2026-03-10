
import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { cn } from '@/lib/utils';
import { Notification } from '@/hooks/useNotifications';
import { useViewportSize } from '@/hooks/useViewportSize';

interface NotificationButtonProps {
  unreadCount: number;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  className
}) => {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { isMobile } = useViewportSize();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false);
      }
    };

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll on mobile when notification panel is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (isMobile) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [showNotificationPanel, isMobile]);
  
  return (
    <div className={cn("relative", className)}>
      <button 
        ref={buttonRef}
        className={cn(
          "relative p-2 rounded-full transition-all duration-200 touch-manipulation",
          "hover:bg-muted active:scale-95",
          unreadCount > 0 
            ? "bg-notification-unread border border-notification-unread-border shadow-sm" 
            : "hover:bg-secondary"
        )}
        onClick={() => {
          if (isMobile) {
            navigate('/notifications');
          } else {
            setShowNotificationPanel(!showNotificationPanel);
          }
        }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing 
            size={isMobile ? 22 : 20} 
            className="text-notification-indicator animate-pulse-light" 
          />
        ) : (
          <Bell 
            size={isMobile ? 22 : 20} 
            className="text-muted-foreground" 
          />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground rounded-full text-xs font-semibold shadow-md animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Active indicator ring */}
        {showNotificationPanel && (
          <div className="absolute inset-0 rounded-full ring-2 ring-primary ring-opacity-50" />
        )}
      </button>
      
      {showNotificationPanel && (
        <div className="animate-fade-in">
          <NotificationPanel 
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllAsRead={onMarkAllAsRead}
            onMarkAsRead={onMarkAsRead}
            onClose={() => setShowNotificationPanel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
