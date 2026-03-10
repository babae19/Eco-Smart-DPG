import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAlerts } from '@/hooks/useAlerts';
import { Alert } from '@/types/AlertTypes';

export interface Notification {
  id: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
  alert_data?: Record<string, unknown>; // JSONB data
  data?: Record<string, unknown>; // For backward compatibility
  type?: string;
}

// Helper function to convert hook alert to AlertTypes format
const convertAlertToAlertType = (alert: any): Alert => ({
  id: alert.id,
  title: String(alert.title || 'Alert'),
  description: String(alert.description || ''),
  severity: (alert.severity || 'low') as 'high' | 'medium' | 'low',
  location: String(alert.location || ''),
  date: String(alert.date || alert.created_at || ''),
  isNew: false,
  type: String(alert.type || 'general')
});

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { alerts } = useAlerts();

  // Reset new notification flag after a short delay
  useEffect(() => {
    if (hasNewNotification) {
      const timer = setTimeout(() => setHasNewNotification(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasNewNotification]);

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    let channels: any[] = [];
    
    const fetchNotifications = async () => {
      if (!isActive) return;
      
      try {
        const nowIso = new Date().toISOString();

        const [dbRes, bcRes] = await Promise.all([
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('broadcast_notifications')
            .select('*')
            .eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        if (!isActive) return;

        if (dbRes.error) {
          console.error('Error fetching notifications:', dbRes.error);
          // Continue with empty array instead of failing completely
        }
        if (bcRes.error) {
          console.error('Error fetching broadcast notifications:', bcRes.error);
          // Continue with empty array instead of failing completely
        }

        const alertNotifications = alerts.map(alert => ({
          id: `alert-${alert.id}`,
          title: alert.title,
          description: alert.description,
          is_read: false,
          created_at: new Date().toISOString(),
          alert_data: alert as unknown as Record<string, unknown>
        }));
        
        const dbNotifications = (dbRes.data || []).map((notif: any) => ({
          ...notif,
          alert_data: notif.alert_data as Record<string, unknown>,
          data: notif.data as Record<string, unknown>
        }));

        const broadcastNotifications = (bcRes.data || []).map((bn: any) => ({
          id: `broadcast-${bn.id}`,
          title: String(bn.title || 'Announcement'),
          description: String(bn.description || ''),
          is_read: false,
          created_at: String(bn.created_at || nowIso),
          type: 'broadcast' as const
        }));

        const combined = [...broadcastNotifications, ...alertNotifications, ...dbNotifications];
        // Dedupe by id
        const uniqueMap = new Map<string, Notification>();
        for (const n of combined) {
          if (!uniqueMap.has(n.id)) uniqueMap.set(n.id, n as Notification);
        }
        const combinedNotifications = Array.from(uniqueMap.values());

        if (isActive) {
          setNotifications(combinedNotifications);
          setUnreadCount(combinedNotifications.filter(notif => !notif.is_read).length);
        }
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
        // Set empty state on error to prevent infinite loading
        if (isActive) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    // Debounce the fetch to prevent excessive API calls
    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchNotifications, 300);
    };

    debouncedFetch();

    // Set up channel for regular notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          }, 
          (payload) => {
            if (!isActive) return;
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setHasNewNotification(true);
          }
      )
      .subscribe();
    channels.push(channel);
      
    // Set up channel for alert notifications
    const alertsChannel = supabase
      .channel('disaster_alerts')
      .on('broadcast', { event: 'new_alert' }, (payload) => {
        if (!isActive) return;
        try {
          const newAlert = payload.payload;
          const alertNotification = {
            id: `alert-${newAlert.id}`,
            title: newAlert.title,
            description: newAlert.description,
            is_read: false,
            created_at: new Date().toISOString(),
            alert_data: newAlert as Record<string, unknown>
          };
          
          setNotifications(prev => [alertNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          setHasNewNotification(true);
        } catch (error) {
          console.error("Error processing alert notification:", error);
        }
      })
      .subscribe();
    channels.push(alertsChannel);

    // Set up channel for broadcast notifications to all users
    const broadcastChannel = supabase
      .channel('public:broadcast_notifications')
      .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'broadcast_notifications'
          }, 
          (payload) => {
            if (!isActive) return;
            try {
              const bn = payload.new as any;
              const nowIso = new Date().toISOString();
              const isActiveNotif = bn?.is_active === true && (!bn?.expires_at || bn.expires_at > nowIso);
              const id = `broadcast-${bn.id}`;

              if (!isActiveNotif) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                return;
              }

              const notification: Notification = {
                id,
                title: String(bn.title || 'Announcement'),
                description: String(bn.description || ''),
                is_read: false,
                created_at: String(bn.created_at || nowIso),
                type: 'broadcast'
              };
              
              setNotifications(prev => {
                const exists = prev.find(n => n.id === id);
                if (exists) {
                  const updated = { ...notification, is_read: exists.is_read };
                  return [updated, ...prev.filter(n => n.id !== id)];
                }
                setUnreadCount(c => c + 1);
                setHasNewNotification(true);
                return [notification, ...prev];
              });
              
              // Show toast for broadcast notifications
              toast({
                title: notification.title,
                description: notification.description,
                variant: 'default',
              });
            } catch (error) {
              console.error("Error processing broadcast notification:", error);
            }
          }
      )
      .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'broadcast_notifications'
          }, 
          (payload) => {
            if (!isActive) return;
            try {
              const bn = payload.new as any;
              const nowIso = new Date().toISOString();
              const isActiveNotif = bn?.is_active === true && (!bn?.expires_at || bn.expires_at > nowIso);
              const id = `broadcast-${bn.id}`;

              if (!isActiveNotif) {
                setNotifications(prev => {
                  const wasUnread = prev.some(n => n.id === id && !n.is_read);
                  if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
                  return prev.filter(n => n.id !== id);
                });
                return;
              }

              const updatedNotification: Notification = {
                id,
                title: String(bn.title || 'Announcement'),
                description: String(bn.description || ''),
                is_read: false,
                created_at: String(bn.created_at || nowIso),
                type: 'broadcast'
              };

              setNotifications(prev => {
                const exists = prev.find(n => n.id === id);
                if (exists) {
                  const merged = { ...updatedNotification, is_read: exists.is_read };
                  return [merged, ...prev.filter(n => n.id !== id)];
                } else {
                  setUnreadCount(c => c + 1);
                  setHasNewNotification(true);
                  return [updatedNotification, ...prev];
                }
              });
            } catch (error) {
              console.error("Error processing broadcast notification:", error);
            }
          }
      )
      .subscribe();
    channels.push(broadcastChannel);
      
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      
      // Safely cleanup all channels
      channels.forEach((ch, index) => {
        try {
          if (ch) supabase.removeChannel(ch);
        } catch (e) {
          console.warn(`Error removing channel ${index}:`, e);
        }
      });
    };
  }, [user, alerts, toast]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking notifications as read:', error);
      return;
    }
    
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    // Skip alert and broadcast notifications (they can't be marked as read in database)
    if (notificationId.startsWith('alert-') || notificationId.startsWith('broadcast-')) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [user]);

  return {
    notifications,
    unreadCount,
    hasNewNotification,
    markAllAsRead,
    markAsRead
  };
}