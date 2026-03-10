
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

export const ReportsFeedLoading: React.FC = () => {
  return (
    <div className="p-2 sm:p-4 max-w-2xl mx-auto">
      {/* Skeleton for hero banner */}
      <div className="bg-gradient-to-r from-violet-400 to-purple-600 animate-pulse rounded-xl p-5 mb-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-64 bg-white/30 rounded mb-3"></div>
            <div className="h-4 w-48 bg-white/20 rounded mb-1"></div>
            <div className="h-4 w-56 bg-white/20 rounded"></div>
          </div>
          <div className="h-9 w-28 bg-white/30 rounded-md"></div>
        </div>
      </div>

      {/* Skeleton for filter bar */}
      <div className="flex justify-between items-center mb-4 bg-white/80 p-3 rounded-lg shadow-sm">
        <div className="flex space-x-2 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <div className="flex gap-3 items-center pt-3 border-t border-gray-100">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-8 w-16 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center justify-center p-2 px-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-full border border-purple-100 z-10">
        <FileText className="text-purple-600 animate-pulse mr-2" size={18} />
        <p className="text-sm font-medium text-purple-800">Loading reports...</p>
      </div>
    </div>
  );
};
