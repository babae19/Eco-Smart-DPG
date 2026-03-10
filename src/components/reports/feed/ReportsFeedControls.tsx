
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Clock, Heart, MapPin } from "lucide-react";

interface ReportsFeedControlsProps {
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: 'latest' | 'trending' | 'most-liked';
  setSortBy: (sort: 'latest' | 'trending' | 'most-liked') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ReportsFeedControls: React.FC<ReportsFeedControlsProps> = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  onRefresh,
  isRefreshing
}) => {
  const filters = [
    { value: 'all', label: 'All Reports', icon: MapPin },
    { value: 'deforestation', label: 'Deforestation', icon: MapPin },
    { value: 'water pollution', label: 'Water', icon: MapPin },
    { value: 'air pollution', label: 'Air', icon: MapPin },
    { value: 'illegal dumping', label: 'Dumping', icon: MapPin },
  ];

  const sortOptions = [
    { value: 'latest' as const, label: 'Latest', icon: Clock },
    { value: 'trending' as const, label: 'Trending', icon: TrendingUp },
    { value: 'most-liked' as const, label: 'Most Liked', icon: Heart },
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Sort Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={sortBy === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(option.value)}
              className={`flex-shrink-0 ${sortBy === option.value ? 'shadow-md' : ''}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </Button>
          );
        })}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex-shrink-0 ml-auto"
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm text-muted-foreground flex-shrink-0 mr-2">Filter:</span>
        {filters.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(option.value)}
            className={`flex-shrink-0 text-xs ${filter === option.value ? 'shadow-sm' : ''}`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
