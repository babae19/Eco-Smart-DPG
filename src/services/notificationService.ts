
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    if (!userId) {
      console.warn('[NotificationService] No user ID provided for notifications');
      return [];
    }

    console.info(`[NotificationService] Fetching notifications for user: ${userId}`);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[NotificationService] Error fetching notifications:', error);
      return [];
    }

    console.info(`[NotificationService] Successfully fetched ${data?.length || 0} notifications`);
    return data || [];
  } catch (error) {
    console.error('[NotificationService] Error in getNotifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    console.info(`[NotificationService] Marking notification as read: ${notificationId}`);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[NotificationService] Error marking notification as read:', error);
      return false;
    }

    console.info(`[NotificationService] Successfully marked notification as read: ${notificationId}`);
    return true;
  } catch (error) {
    console.error('[NotificationService] Error in markNotificationAsRead:', error);
    return false;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  description: string,
  type: string
): Promise<boolean> => {
  try {
    console.info(`[NotificationService] Creating notification for user ${userId}:`, { title, type });
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        is_read: false
      });

    if (error) {
      console.error('[NotificationService] Error creating notification:', error);
      return false;
    }

    console.info(`[NotificationService] Successfully created notification for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[NotificationService] Error in createNotification:', error);
    return false;
  }
};
