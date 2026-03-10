import React, { useState, useCallback, useMemo } from 'react';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { ReportsFeedHero } from './feed/ReportsFeedHero';
import { ReportsFeedControls } from './feed/ReportsFeedControls';
import { ReportsFeedLoading } from './ReportsFeedLoading';
import { ReportsFeedError } from './feed/ReportsFeedError';
import { ReportsFeedEmpty } from './ReportsFeedEmpty';
import EnhancedReportCard from './EnhancedReportCard';
import { ReportCommentsModal } from './ReportCommentsModal';
import { useAuth } from '@/contexts/AuthContext';
import { useViewportSize } from '@/hooks/useViewportSize';
import { upvoteReport, likeReport } from '@/services/reportService';
import { toast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

export const RealtimeReportsFeed: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isMobile } = useViewportSize();
  
  const {
    reports,
    loading,
    error,
    filter,
    setFilter,
    refresh,
    totalCount
  } = useRealtimeReports();

  const [activeCommentsReport, setActiveCommentsReport] = useState<any | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'most-liked'>('latest');

  // Handle opening comments modal
  const handleOpenComments = useCallback((report: any) => {
    setActiveCommentsReport(report);
    setCommentsOpen(true);
  }, []);

  // Handle upvoting with proper error handling
  const handleUpvote = useCallback(async (reportId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upvote reports",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedReport = await upvoteReport(reportId);
      if (updatedReport) {
        toast({
          title: "Upvoted",
          description: "Thank you for supporting this issue",
        });
        // The realtime subscription will handle the update automatically
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote report. Please try again.",
        variant: "destructive",
      });
      console.error("Error upvoting report:", error);
    }
  }, [isAuthenticated]);

  // Handle liking with proper error handling
  const handleLike = useCallback(async (reportId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like reports",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedReport = await likeReport(reportId);
      if (updatedReport) {
        toast({
          title: "Liked",
          description: "You liked this report",
        });
        // The realtime subscription will handle the update automatically
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like report. Please try again.",
        variant: "destructive",
      });
      console.error("Error liking report:", error);
    }
  }, [isAuthenticated]);

  // Manual refresh handler with debounce
  const handleManualRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    refresh();
    
    // Reset refreshing status after animation completes
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [isRefreshing, refresh]);

  // Sort and filter reports
  const sortedAndFilteredReports = useMemo(() => {
    let filtered = reports;

    // Apply issue type filter
    if (filter !== 'all') {
      filtered = reports.filter(r => 
        r.issueType?.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'trending':
          // Trending = combination of recent activity and engagement
          const aScore = (a.upvotes || 0) + (a.comments?.length || 0) * 2;
          const bScore = (b.upvotes || 0) + (b.comments?.length || 0) * 2;
          return bScore - aScore;
        case 'most-liked':
          return (b.upvotes || 0) - (a.upvotes || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [reports, filter, sortBy]);

  const verifiedCount = reports.filter(r => r.status === 'approved').length;

  if (loading) {
    return <ReportsFeedLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <ReportsFeedHero 
          isAuthenticated={isAuthenticated}
          totalReports={reports.length}
          verifiedReports={verifiedCount}
        />

        {error && (
          <ReportsFeedError error={error} onRetry={refresh} timestamp={Date.now()} />
        )}

        <ReportsFeedControls
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {sortedAndFilteredReports.length === 0 ? (
          <ReportsFeedEmpty setFilter={setFilter} />
        ) : (
          <div className="space-y-6">
            {/* Real-time status indicator */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-semibold text-foreground">
                  Live Updates
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Showing {sortedAndFilteredReports.length} {sortedAndFilteredReports.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6">
              {sortedAndFilteredReports.map((report) => (
                <EnhancedReportCard
                  key={report.id}
                  report={report}
                  onUpvote={handleUpvote}
                  onOpenComments={() => handleOpenComments(report)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        )}

        <ReportCommentsModal
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
          report={activeCommentsReport}
        />
      </div>
    </ErrorBoundary>
  );
};