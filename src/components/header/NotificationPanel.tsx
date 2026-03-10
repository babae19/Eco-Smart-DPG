import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, AlertTriangle, Info, CheckCircle, ExternalLink, Check } from 'lucide-react';
import { getSeverityStyles } from '@/components/alerts/StylesConfig';
import { cn } from '@/lib/utils';
import { Notification } from '@/hooks/useNotifications';
import { useViewportSize } from '@/hooks/useViewportSize';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onClose,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useViewportSize();

  // Sort notifications by read status and date
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1; // Unread first
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'campaign' || notification.type === 'campaign_status') {
      navigate('/campaigns');
    } else if (notification.type === 'report' || notification.type === 'report_status') {
      navigate('/reports-feed');
    } else if (notification.alert_data || notification.id.startsWith('alert-')) {
      navigate('/alerts');
    }
    
    onClose();
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.id.toString().startsWith('alert-') && notification.alert_data) {
      const severity = notification.alert_data?.severity;
      const style = getSeverityStyles(typeof severity === 'string' ? severity : 'low');
      return style.icon;
    }
    
    switch (notification.type) {
      case 'campaign':
      case 'campaign_status':
        return <Info size={16} className="text-info" />;
      case 'report':
      case 'report_status':
        return <CheckCircle size={16} className="text-success" />;
      default:
        return <Info size={16} className="text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (notification: Notification) => {
    if (notification.id.toString().startsWith('alert-') && notification.alert_data) {
      const severity = notification.alert_data.severity;
      return (
        <Badge 
          variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {typeof severity === 'string' ? severity.toUpperCase() : 'LOW'}
        </Badge>
      );
    }
    return null;
  };

  const renderNotificationItem = (notification: Notification) => {
    const isAlert = notification.id.toString().startsWith('alert-');
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
    
    return (
      <Card 
        key={notification.id} 
        className={cn(
          "mb-2 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]",
          "border-l-4",
          !notification.is_read 
            ? "bg-notification-unread border-l-notification-indicator shadow-sm" 
            : "bg-card border-l-border hover:bg-muted/30"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                  "font-medium text-sm leading-tight",
                  !notification.is_read ? "text-foreground" : "text-muted-foreground"
                )}>
                  {notification.title}
                </h4>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-notification-indicator rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {notification.description}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(notification)}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{timeAgo}</span>
                  </div>
                </div>
                
                {/* Mark as read button */}
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    <Check size={12} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const panelWidth = isMobile ? 'w-screen max-w-sm' : 'w-96';
  
  return (
    <div className={cn(
      "fixed right-4 top-16 bg-background border border-border rounded-lg shadow-xl z-[9999]",
      "max-h-[calc(100vh-80px)] overflow-hidden animate-scale-in",
      isMobile ? "left-4 right-4 w-auto" : "w-96"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs h-7 px-2"
            >
              <Check size={12} className="mr-1" />
              Mark all read
            </Button>
          )}
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-3 space-y-1">
        {sortedNotifications.length > 0 ? (
          <div className="space-y-2">
            {sortedNotifications.map(renderNotificationItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <CheckCircle size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">You have no new notifications</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <Button 
          variant="ghost"
          size="sm"
          className="w-full justify-center text-sm h-8"
          onClick={() => {
            navigate('/alerts');
            onClose();
          }}
        >
          <ExternalLink size={14} className="mr-2" />
          View all alerts
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;