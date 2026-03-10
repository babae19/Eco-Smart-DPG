
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, FileText, Users, Plus } from 'lucide-react';
import { useViewportSize } from '@/hooks/useViewportSize';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isSmallMobile } = useViewportSize();

  const isActive = (path: string) => {
    if (path === '/reports-feed' || path === '/reports') {
      return location.pathname === '/reports-feed' || location.pathname === '/reports';
    }
    if (path === '/report') {
      return location.pathname === '/report';
    }
    if (path === '/campaigns') {
      return location.pathname === '/campaigns';
    }
    return location.pathname === path;
  };

  // TikTok-style dimensions and proportions
  const iconSize = isMobile ? 26 : 24;
  const centerIconSize = isMobile ? 32 : 28;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200/60 dark:border-gray-700/60 z-20 safe-area-inset-bottom">
      <div className="flex justify-around items-end h-20 px-2">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] touch-manipulation active:scale-95 transition-all ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home size={iconSize} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        
        <button
          onClick={() => navigate('/alerts')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] touch-manipulation active:scale-95 transition-all ${isActive('/alerts') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <AlertTriangle size={iconSize} strokeWidth={isActive('/alerts') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Alerts</span>
        </button>
        
        <button
          onClick={() => navigate('/report')}
          className="flex flex-col items-center justify-center -mt-6 px-4 min-w-[60px] touch-manipulation active:scale-95 transition-transform"
        >
          <div className={`rounded-2xl p-3.5 shadow-lg mb-1 ${isActive('/report') ? 'bg-primary' : 'bg-primary/90'}`}>
            <Plus size={centerIconSize} className="text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/report') ? 'text-primary' : 'text-muted-foreground'}`}>Report</span>
        </button>
        
        <button
          onClick={() => navigate('/reports-feed')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] touch-manipulation active:scale-95 transition-all ${isActive('/reports-feed') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <FileText size={iconSize} strokeWidth={isActive('/reports-feed') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Reports</span>
        </button>
        
        <button
          onClick={() => navigate('/campaigns')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] touch-manipulation active:scale-95 transition-all ${isActive('/campaigns') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Users size={iconSize} strokeWidth={isActive('/campaigns') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Campaigns</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
