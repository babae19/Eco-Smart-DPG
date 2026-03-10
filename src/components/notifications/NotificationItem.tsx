import React from 'react';
import { Clock, AlertTriangle, Info, Bell, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = () => {
    if (notification.alert_data?.severity) {
      switch (notification.alert_data.severity) {
        case 'high':
          return <AlertTriangle size={20} className="text-destructive" />;
        case 'medium':
          return <Info size={20} className="text-warning" />;
        case 'low':
          return <Bell size={20} className="text-muted-foreground" />;
      }
    }
    
    switch (notification.type) {
      case 'alert':
        return <AlertTriangle size={20} className="text-destructive" />;
      case 'broadcast':
        return <Bell size={20} className="text-primary" />;
      default:
        return <Info size={20} className="text-muted-foreground" />;
    }
  };

  const getSeverityBadge = () => {
    if (!notification.alert_data?.severity) return null;
    
    const severityColors: Record<string, string> = {
      high: 'bg-destructive text-destructive-foreground',
      medium: 'bg-warning text-warning-foreground',
      low: 'bg-muted text-muted-foreground'
    };

    return (
      <Badge variant="secondary" className={severityColors[typeof notification.alert_data?.severity === 'string' ? notification.alert_data.severity : 'low']}>
        {typeof notification.alert_data?.severity === 'string' ? notification.alert_data.severity.toUpperCase() : 'LOW'}
      </Badge>
    );
  };

  return (
    <Card className={notification.is_read ? 'opacity-75' : 'border-primary/20'}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon()}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                {notification.title}
              </h3>
              <div className="flex items-center space-x-2">
                {getSeverityBadge()}
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Mark read
                  </Button>
                )}
              </div>
            </div>
            
            <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
              {notification.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock size={12} />
                <span>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {notification.alert_data?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{String(notification.alert_data.location || '')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;