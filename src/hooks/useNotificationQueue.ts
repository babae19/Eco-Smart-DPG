import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendDisasterAlertNotification, sendWeatherAdvisoryNotification } from '@/services/pushNotificationService';
import { useAuth } from '@/contexts/AuthContext';

interface QueuedNotification {
  id: string;
  type: 'toast' | 'push' | 'both';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: number;
  pushType?: 'disaster' | 'weather';
}

export const useNotificationQueue = () => {
  const [queue, setQueue] = useState<QueuedNotification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Add notification to queue with deduplication
  const addToQueue = useCallback((notification: Omit<QueuedNotification, 'id' | 'timestamp'>) => {
    setQueue(prev => {
      // Check for duplicate notifications within the last 30 seconds
      const now = Date.now();
      const isDuplicate = prev.some(existing => 
        existing.title === notification.title && 
        (now - existing.timestamp) < 30000
      );
      
      if (isDuplicate) {
        console.log('[Notification Queue] Skipping duplicate notification:', notification.title);
        return prev;
      }
      
      const queuedNotification: QueuedNotification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: now
      };
      
      console.log('[Notification Queue] Added notification:', queuedNotification.title);
      return [...prev, queuedNotification];
    });
  }, []);

  // Process queue one notification at a time with 2-minute intervals
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    
    console.log('[Notification Queue] Processing queue with', queue.length, 'notifications');
    
    // Process the first notification immediately
    const notification = queue[0];
    
    try {
      // Skip toast notifications to avoid popups
      
      // Send push notification
      if ((notification.type === 'push' || notification.type === 'both') && user?.id) {
        if (notification.pushType === 'disaster') {
          await sendDisasterAlertNotification(
            user.id,
            notification.title,
            notification.description,
            notification.severity
          );
        } else if (notification.pushType === 'weather') {
          await sendWeatherAdvisoryNotification(
            user.id,
            notification.title,
            notification.description,
            notification.severity
          );
        }
      }
      
      console.log('[Notification Queue] Processed notification:', notification.title);
      
      // Remove processed notification from queue
      setQueue(prev => prev.slice(1));
      
    } catch (error) {
      console.error('[Notification Queue] Error processing notification:', error);
      // Remove failed notification and continue
      setQueue(prev => prev.slice(1));
    }
    
    processingRef.current = false;
    setIsProcessing(false);
    
    // Schedule next notification processing if there are more
    if (queue.length > 1) {
      console.log('[Notification Queue] Scheduling next notification in 2 minutes...');
      setTimeout(() => {
        processQueue();
      }, 120000); // 2 minutes = 120,000ms
    }
  }, [queue, toast, user?.id]);

  // Start processing when queue has items and not already processing
  useEffect(() => {
    if (queue.length > 0 && !processingRef.current) {
      processQueue();
    }
  }, [queue.length, processQueue]);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    console.log('[Notification Queue] Queue cleared');
  }, []);

  return {
    addToQueue,
    clearQueue,
    queueLength: queue.length,
    isProcessing
  };
};