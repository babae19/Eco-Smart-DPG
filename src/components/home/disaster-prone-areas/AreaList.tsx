
import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import { getDisasterImage } from '@/services/weather/weatherIconUtils';
import { motion } from 'framer-motion';

interface AreaListProps {
  areas: DisasterProneArea[];
  onSelectArea: (area: DisasterProneArea) => void;
}

const AreaItem = React.memo(({ 
  area, 
  onSelectArea,
  index 
}: { 
  area: DisasterProneArea; 
  onSelectArea: (area: DisasterProneArea) => void;
  index: number;
}) => {
  const primaryRisk = area.risks && area.risks.length > 0 ? area.risks[0] : 'Unknown';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 
                 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
      onClick={() => onSelectArea(area)}
    >
      <div className="flex flex-col sm:flex-row sm:h-32">
        {/* Image thumbnail */}
        <div className="w-full sm:w-1/3 h-32 sm:h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <img 
            src={getDisasterImage(primaryRisk, area.name)}
            alt={`${area.name} - ${primaryRisk}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        {/* Content */}
        <div className="w-full sm:w-2/3 p-4">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 text-lg mb-2">{area.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {area.risks.map((risk, idx) => (
              <div key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 
                                      text-gray-700 dark:text-gray-300">
                {risk}
              </div>
            ))}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">
              {area.coordinates.latitude.toFixed(4)}, {area.coordinates.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const AreaList: React.FC<AreaListProps> = ({ areas, onSelectArea }) => {
  const areaItems = useMemo(() => {
    return areas.map((area, index) => (
      <AreaItem 
        key={area.id} 
        area={area} 
        onSelectArea={onSelectArea}
        index={index}
      />
    ));
  }, [areas, onSelectArea]);

  return (
    <div className="grid gap-4 overflow-y-auto pr-2 max-h-[60vh]">
      {areaItems}
    </div>
  );
};

export default React.memo(AreaList);
