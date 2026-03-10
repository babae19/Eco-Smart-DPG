
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ReportsFeedEmptyProps {
  setFilter?: (filter: string) => void;
}

export const ReportsFeedEmpty: React.FC<ReportsFeedEmptyProps> = ({ setFilter }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-purple-100 rounded-full p-5 mb-4">
        <Search className="text-purple-700 h-8 w-8" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
      
      <p className="text-gray-600 max-w-sm mb-6">
        {setFilter 
          ? "We couldn't find any reports matching your current filter. Try a different category or be the first to report an issue."
          : "There are no community reports yet. Be the first to report an environmental issue in your area!"}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {setFilter && (
          <Button 
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => setFilter('all')}
          >
            <RefreshCw size={16} className="mr-2" />
            View All Reports
          </Button>
        )}
        
        {isAuthenticated && (
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            asChild
          >
            <Link to="/report">
              <FileText size={16} className="mr-2" />
              Create New Report
            </Link>
          </Button>
        )}
      </div>
      
      {!isAuthenticated && (
        <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <p className="text-sm text-purple-800 mb-2">
            Login to create your own environmental reports and help your community
          </p>
          <Button asChild size="sm">
            <Link to="/login">
              Login to Contribute
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
