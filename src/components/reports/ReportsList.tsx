
import React, { useMemo } from 'react';
import { Report } from '@/services/reports/reportTypes';
import { VirtualizedReportList } from './VirtualizedReportList';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ReportsListProps {
  reports: Report[];
  onUpvote: (reportId: string) => void;
  onLike: (reportId: string) => void;
  onComment: (reportId: string, comment: string) => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({ 
  reports, 
  onUpvote, 
  onLike, 
  onComment 
}) => {
  const { isAuthenticated } = useAuth();
  
  // Handler for actions that require authentication
  const handleAuthenticatedAction = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to perform this action",
        variant: "default",
      });
      return false;
    }
    
    action();
    return true;
  };
  
  // Secure handlers for report actions
  const secureUpvote = (reportId: string) => {
    handleAuthenticatedAction(() => onUpvote(reportId));
  };
  
  const secureLike = (reportId: string) => {
    handleAuthenticatedAction(() => onLike(reportId));
  };
  
  const secureComment = (reportId: string, comment: string) => {
    handleAuthenticatedAction(() => onComment(reportId, comment));
  };
  
  // Memoize the filtering of valid reports to prevent unnecessary re-renders
  const validReports = useMemo(() => {
    // Filter out invalid reports to prevent rendering errors
    const filtered = reports.filter(report => report && report.id && report.title);
    
    // Log if any reports were filtered out
    if (filtered.length !== reports.length) {
      console.warn(`[ReportsList] Filtered out ${reports.length - filtered.length} invalid reports`);
    }
    
    return filtered;
  }, [reports]);
  
  // Wrap the component in an error boundary to handle unexpected errors
  try {
    return (
      <VirtualizedReportList
        reports={validReports}
        onUpvote={secureUpvote}
        onLike={secureLike}
        onComment={secureComment}
      />
    );
  } catch (error) {
    console.error('[ReportsList] Error rendering VirtualizedReportList:', error);
    
    // Fallback to a simple non-virtualized list
    return (
      <div className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          Error rendering optimized list. Showing basic version.
        </div>
        
        {validReports.map(report => (
          <div key={report.id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold">{report.title}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => secureUpvote(report.id)}
                className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
              >
                Upvote ({report.upvotes})
              </button>
              <button 
                onClick={() => secureLike(report.id)}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                Like ({report.likes})
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};
