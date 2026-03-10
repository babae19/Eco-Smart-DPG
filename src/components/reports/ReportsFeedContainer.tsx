
import React, { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ReportsFeedLoading } from './ReportsFeedLoading';

// Lazy load the content component for better performance
const ReportsFeedContent = lazy(() => import('./ReportsFeedContent'));

const ReportsFeedContainer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 pb-16">
      <Header 
        title="Community Reports" 
        showBackButton
        transparent={false}
      />
      <div className="bg-primary h-16 -mt-16 mb-4"></div>
      
      <Suspense fallback={<ReportsFeedLoading />}>
        <ReportsFeedContent />
      </Suspense>
      
      <BottomNavigation />
    </div>
  );
};

export default ReportsFeedContainer;
