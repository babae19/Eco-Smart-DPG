
import React, { useEffect, useRef, useCallback } from 'react';
import { Report } from '@/services/reports/reportTypes';
import ReportCard from './reports/ReportCard';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAuth } from '@/contexts/AuthContext';

interface VirtualizedReportListProps {
  reports: Report[];
  onUpvote: (reportId: string) => void;
  onLike: (reportId: string) => void;
  onComment: (reportId: string, comment: string) => void;
}

export const VirtualizedReportList: React.FC<VirtualizedReportListProps> = ({
  reports,
  onUpvote,
  onLike,
  onComment
}) => {
  const { isAuthenticated } = useAuth();
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Report interaction callback (safer type definition)
  const handleOpenComments = useCallback((report: Report) => {
    console.log('Opening comments for report:', report.id);
    
    // Check authentication before allowing comments
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot comment');
      return;
    }
    
    // We can't actually add comments here since onComment expects a different signature
    // But we can call the function with an empty string
    onComment(report.id, '');
  }, [onComment, isAuthenticated]);

  // Dynamic item size estimation based on report content
  const getEstimatedSize = useCallback((index: number) => {
    const report = reports[index];
    
    // Base height 
    let height = 200;
    
    // Add height for images
    if (report.images && report.images.length > 0) {
      height += 200; // Standard image height
    }
    
    // Add height for longer descriptions
    if (report.description && report.description.length > 100) {
      // Add approximately 20px per 100 chars for text wrapping
      height += Math.ceil(report.description.length / 100) * 20;
    }
    
    // Add height for comments
    if (report.comments && report.comments.length > 0) {
      height += 30; // Extra height to show comment count
    }
    
    return height;
  }, [reports]);

  // Improved virtualizer with better options
  const virtualizer = useVirtualizer({
    count: reports.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getEstimatedSize,
    overscan: 5, // Number of items to render beyond visible area
    scrollPaddingStart: 8,
    scrollPaddingEnd: 8,
  });
  
  // Log performance metrics in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('VirtualizedReportList rendered with', reports.length, 'reports');
      console.log('Virtualizer calculated total size:', virtualizer.getTotalSize(), 'px');
      console.log('Virtualizer rendering', virtualizer.getVirtualItems().length, 'items');
      
      if (parentRef.current) {
        console.log('Container size:', parentRef.current?.offsetHeight, 'x', parentRef.current?.offsetWidth);
      }
    }
  }, [reports.length, virtualizer]);

  // If there are no reports, don't try to render anything
  if (!reports.length) {
    return <div className="p-4 text-center text-gray-500">No reports available</div>;
  }

  return (
    <div 
      ref={parentRef} 
      className="h-[calc(100vh-200px)] overflow-auto scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const report = reports[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                padding: '4px 0',
              }}
            >
              <ReportCard
                report={report}
                onUpvote={onUpvote}
                onLike={onLike}
                onOpenComments={() => handleOpenComments(report)}
                isMobile={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
