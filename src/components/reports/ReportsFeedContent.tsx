
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorBoundaryFallback from '@/components/ErrorBoundaryFallback';
import { ReportsFeedView } from './feed/ReportsFeedView';
import { ReportsFeedLoading } from './ReportsFeedLoading';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const ReportsFeedContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Show a helpful message if the user isn't authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      // We use toast to avoid blocking the UI, but still inform the user
      toast({
        title: "Authentication recommended",
        description: "Login to interact with reports and create your own",
        variant: "default",
      });
    }
  }, [isAuthenticated]);
  
  return (
    <ErrorBoundary
      fallback={
        <ErrorBoundaryFallback 
          title="Reports feed unavailable"
          description="We couldn't load community reports right now. Please try again."
        />
      }
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ReportsFeedView />
      </div>
    </ErrorBoundary>
  );
};

export default ReportsFeedContent;
