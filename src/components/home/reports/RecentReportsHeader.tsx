
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RecentReportsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-4 sm:mb-6">
      {/* Main Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
          <div className="bg-gradient-to-r from-climate-green to-climate-green-dark p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md flex-shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
              <span className="truncate">Community Reports</span>
              <Badge variant="secondary" className="bg-climate-green/10 text-climate-green border-climate-green/20 text-xs font-medium whitespace-nowrap">
                Live
              </Badge>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
              Latest environmental issues from your community
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <Button 
            onClick={() => navigate('/report')}
            className="bg-gradient-to-r from-climate-green to-climate-green-dark hover:from-climate-green-dark hover:to-climate-green text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-climate-green border-climate-green/30 hover:bg-climate-green/10 hover:border-climate-green/50 font-medium text-sm sm:text-base w-full sm:w-auto"
            onClick={() => navigate('/reports-feed')}
          >
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View All Reports</span>
            <span className="sm:hidden">View All</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 rounded-full text-center sm:text-left">
          Updates every minute
        </div>
      </div>
    </div>
  );
};

export default RecentReportsHeader;
