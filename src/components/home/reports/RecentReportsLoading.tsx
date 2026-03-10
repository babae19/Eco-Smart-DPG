
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const RecentReportsLoading: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-px bg-gray-200 w-full"></div>
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReportsLoading;
