import React from 'react';
import { AlertCircle, RefreshCw, TrendingUp, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecentReportsList from './reports/RecentReportsList';
import RecentReportsLoading from './reports/RecentReportsLoading';
import RecentReportsEmpty from './reports/RecentReportsEmpty';
import { useRecentReports } from './reports/useRecentReports';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const EnhancedRecentReportsSection: React.FC = () => {
  const { reports, loading, error, retryFetch } = useRecentReports(3);
  const navigate = useNavigate();
  
  return (
    <section className="mb-6">
      {/* Enhanced Header with Stats */}
      <Card className="mb-4 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Community Reports
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time environmental issues from your community
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reports-feed')}
              className="hover:bg-primary/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
          
          {/* Quick Stats */}
          {!loading && reports.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs text-muted-foreground font-medium">Active</span>
                </div>
                <div className="text-lg font-bold text-foreground">{reports.length}</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Upvotes</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {reports.reduce((sum, r) => sum + r.upvotes, 0)}
                </div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  <span className="text-xs text-muted-foreground font-medium">Issues</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {new Set(reports.map(r => r.issueType)).size}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={retryFetch}
              className="flex items-center text-xs bg-destructive/20 hover:bg-destructive/30 px-2 py-1 rounded"
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

export default EnhancedRecentReportsSection;
