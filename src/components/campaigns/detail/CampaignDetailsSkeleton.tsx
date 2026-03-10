
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Skeleton } from '@/components/ui/skeleton';

export const CampaignDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Loading Campaign..." showBackButton />
      
      {/* Skeleton for campaign header */}
      <div className="relative">
        <Skeleton className="h-64 w-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
      
      {/* Skeleton for action buttons */}
      <div className="flex justify-end p-2 bg-white border-b">
        <Skeleton className="h-8 w-20 mr-2" />
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Skeleton for campaign info */}
      <div className="p-4">
        <div className="flex mb-4 space-x-2">
          <Skeleton className="h-6 w-28" />
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
      
      {/* Skeleton for campaign actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md">
        <div className="flex gap-2 max-w-md mx-auto">
          <Skeleton className="flex-1 h-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
