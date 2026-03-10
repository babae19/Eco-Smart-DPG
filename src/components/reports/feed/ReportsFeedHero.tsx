
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, Shield } from "lucide-react";

interface ReportsFeedHeroProps {
  isAuthenticated: boolean;
  totalReports?: number;
  verifiedReports?: number;
}

export const ReportsFeedHero: React.FC<ReportsFeedHeroProps> = ({ 
  isAuthenticated, 
  totalReports = 0,
  verifiedReports = 0 
}) => {
  return (
    <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl text-primary-foreground">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">
              Community Reports
            </h1>
          </div>
          <p className="text-sm sm:text-base opacity-90 mb-4 max-w-2xl">
            Join our community in reporting and addressing environmental issues. Every report helps create awareness and drives meaningful change.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{totalReports} Reports</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">{verifiedReports} Verified</span>
            </div>
          </div>
        </div>
        
        {isAuthenticated && (
          <Button 
            size="lg" 
            variant="secondary"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
            asChild
          >
            <Link to="/report" className="flex items-center gap-2">
              <Plus size={20} />
              <span className="font-semibold">Submit Report</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
