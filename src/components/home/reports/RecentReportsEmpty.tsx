
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecentReportsEmpty: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-climate-green/5 to-climate-green-dark/5 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8 text-center">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Enhanced Icon - Mobile Responsive */}
          <div className="relative">
            <div className="bg-gradient-to-r from-climate-green to-climate-green-dark p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full animate-pulse">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-700" />
            </div>
          </div>
          
          {/* Enhanced Content - Mobile Responsive */}
          <div className="space-y-2 sm:space-y-3 max-w-sm px-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Be a Community Hero! 🌱
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Help protect our environment by reporting issues in your area. Every report makes a difference in building a sustainable future.
            </p>
          </div>
          
          {/* Enhanced Call-to-Action - Mobile Responsive */}
          <div className="flex flex-col gap-3 w-full max-w-xs px-2">
            <Button 
              onClick={() => navigate('/report')}
              className="bg-gradient-to-r from-climate-green to-climate-green-dark hover:from-climate-green-dark hover:to-climate-green text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base py-2.5 sm:py-3"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Report First Issue
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate('/reports-feed')}
              className="text-climate-green hover:bg-climate-green/10 font-medium text-sm sm:text-base"
            >
              View Community Reports
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Community Stats Preview - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground bg-muted/30 px-3 sm:px-4 py-2 rounded-full">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-climate-green rounded-full mr-2 animate-pulse"></div>
              Join the movement
            </span>
            <span className="hidden sm:inline">Make an impact today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReportsEmpty;
