
import React from 'react';

export const ReportDetailSkeleton: React.FC = () => {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
