
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import RecentReportsHeader from './reports/RecentReportsHeader';
import RecentReportsList from './reports/RecentReportsList';
import RecentReportsLoading from './reports/RecentReportsLoading';
import RecentReportsEmpty from './reports/RecentReportsEmpty';
import { useRecentReports } from './reports/useRecentReports';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RecentReportsSection: React.FC = () => {
  const { reports, loading, error, retryFetch } = useRecentReports(3);
  
  return (
    <section className="mb-6">
      <RecentReportsHeader />
      
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={retryFetch}
              className="flex items-center text-xs bg-red-800 hover:bg-red-700 text-white px-2 py-1 rounded"
            >
              <RefreshCw size={12} className="mr-1" />
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <RecentReportsLoading />
      ) : reports.length > 0 ? (
        <RecentReportsList reports={reports} />
      ) : (
        <RecentReportsEmpty />
      )}
    </section>
  );
};

export default RecentReportsSection;
