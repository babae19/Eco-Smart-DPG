
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, UserRound } from 'lucide-react';
import EcoLogo from './EcoLogo';
import { useAuth } from '@/contexts/AuthContext';
import NotificationButton from './header/NotificationButton';
import NotificationSound from './notifications/NotificationSound';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showNotification = true,
  showSettings = false,
  transparent = false,
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { notifications, unreadCount, hasNewNotification, markAllAsRead, markAsRead } = useNotifications();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      <NotificationSound shouldPlay={hasNewNotification} />
      <header className={cn(
        "sticky top-0 z-10",
        transparent ? "bg-transparent" : "bg-background shadow-sm border-b border-border"
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 mr-2 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft size={20} className="text-muted-foreground" />
              </button>
            )}
            {title ? (
              <h1 className="text-lg font-semibold text-foreground">
                {title}
              </h1>
            ) : (
              <EcoLogo size="sm" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {showNotification && user && (
              <NotificationButton 
                unreadCount={unreadCount}
                notifications={notifications}
                onMarkAllAsRead={markAllAsRead}
                onMarkAsRead={markAsRead}
              />
            )}
            
            {user && (
              <button 
                onClick={handleProfileClick}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Go to profile"
              >
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserRound size={16} />
                    </AvatarFallback>
                  )}
                </Avatar>
              </button>
            )}
            
            {showSettings && (
              <button 
                className="p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => navigate('/settings')}
              >
                <Settings size={20} className="text-muted-foreground" />
              </button>
            )}
          </div>
      </div>
    </header>
    </>
  );
};

export default Header;
