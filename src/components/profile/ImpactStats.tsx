
import React from 'react';
import { Loader2 } from 'lucide-react';
import { UserStats } from '@/hooks/useUserStats';

interface ImpactStatsProps {
  stats: UserStats;
  loading: boolean;
}

const ImpactStats: React.FC<ImpactStatsProps> = ({
  stats,
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="font-medium text-gray-800">My Impact</h3>
      </div>
      
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        <div className="p-3 sm:p-4 text-center">
          {loading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto text-green-600" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.reports}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Reports</p>
        </div>
        <div className="p-3 sm:p-4 text-center">
          {loading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto text-green-600" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.tips}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Tips</p>
        </div>
        <div className="p-3 sm:p-4 text-center">
          {loading ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto text-green-600" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.campaigns}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Campaigns</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactStats;
