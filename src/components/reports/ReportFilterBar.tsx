
import React from 'react';
import { Button } from '@/components/ui/button';

interface ReportFilterBarProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({ filter, setFilter }) => {
  const filters = [
    { id: 'all', label: 'All Reports' },
    { id: 'Illegal Dumping', label: 'Dumping' },
    { id: 'Deforestation', label: 'Deforestation' },
    { id: 'Water Pollution', label: 'Water' },
    { id: 'Air Pollution', label: 'Air' },
    { id: 'Wildlife Endangerment', label: 'Wildlife' }
  ];
  
  return (
    <div className="overflow-x-auto pb-1 flex items-center">
      <div className="flex space-x-1">
        {filters.map((item) => (
          <Button
            key={item.id}
            variant={filter === item.id ? "default" : "outline"}
            className="px-3 py-1 h-8 text-xs font-medium rounded-full whitespace-nowrap"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
