
import React, { useMemo } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ReportsFeedEmpty } from "../ReportsFeedEmpty";
import ReportCard from "../ReportCard";

// Memoized ReportCard component to prevent unnecessary re-renders
const MemoizedReportCard = React.memo(ReportCard);

interface ReportsFeedContentProps {
  reports: any[];
  isMobile: boolean;
  onUpvote: (reportId: string) => void;
  onLike: (reportId: string) => void;
  onOpenComments: (report: any) => void;
  setFilter: (filter: string) => void;
}

export const ReportsFeedContent: React.FC<ReportsFeedContentProps> = ({
  reports,
  isMobile,
  onUpvote,
  onLike,
  onOpenComments,
  setFilter
}) => {
  // Use memo to prevent unnecessary re-renders of report items
  const reportItems = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    
    return reports.map((report: any) => (
      <div key={report.id} className="mb-3">
        <MemoizedReportCard
          report={report}
          isMobile={isMobile}
          onUpvote={onUpvote}
          onLike={onLike}
          onOpenComments={() => onOpenComments(report)}
        />
      </div>
    ));
  }, [reports, isMobile, onUpvote, onLike, onOpenComments]);

  return (
    <ErrorBoundary>
      <div className="bg-gradient-to-b from-green-50/50 to-white/70 rounded-xl p-4 shadow-sm">
        {reports && reports.length > 0 ? (
          <div>{reportItems}</div>
        ) : (
          <ReportsFeedEmpty setFilter={setFilter} />
        )}
      </div>
    </ErrorBoundary>
  );
};
