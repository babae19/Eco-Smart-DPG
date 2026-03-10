
import React from 'react';
import ReportsFeedContainer from '@/components/reports/ReportsFeedContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const ReportsFeed: React.FC = () => {
  return (
    <ErrorBoundary>
      <ReportsFeedContainer />
    </ErrorBoundary>
  );
};

export default ReportsFeed;
