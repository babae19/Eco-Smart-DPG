
import { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

// Export interface so it can be imported elsewhere
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'danger';
  icon: React.ReactNode;
}

export const useLocationBasedNotifications = () => {
  const [notifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [notificationIndex] = useState(0);

  // All notification functionality disabled
  const handleClose = () => {
    setActiveNotification(null);
  };
  
  const handleNext = () => {
    // No-op function
  };

  return {
    activeNotification: null, // Always return null to prevent notifications
    notifications,
    notificationIndex,
    handleClose,
    handleNext
  };
};
