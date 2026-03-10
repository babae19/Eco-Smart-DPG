
import React from 'react';
import { MapPin } from 'lucide-react';
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import { getDisasterImage } from '@/services/weather/weatherIconUtils';

interface AreaCardProps {
  area: DisasterProneArea;
  onClick: (area: DisasterProneArea) => void;
}

const AreaCard: React.FC<AreaCardProps> = ({ area, onClick }) => {
  // Get primary risk for an area
  const getPrimaryRisk = (risks: string[]) => {
    return risks && risks.length > 0 ? risks[0] : 'Unknown';
  };

  return (
    <div 
      key={area.id} 
      className="bg-white rounded-lg shadow-sm p-0 border border-gray-100 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(area)}
    >
      <div className="h-32 relative overflow-hidden">
        <img 
          src={getDisasterImage(getPrimaryRisk(area.risks), area.name)}
          alt={`${area.name} - ${getPrimaryRisk(area.risks)}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800">{area.name}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {area.risks.map((risk, idx) => (
            <div key={idx} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
              {risk}
            </div>
          ))}
        </div>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <MapPin size={12} className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {area.coordinates.latitude.toFixed(4)}, {area.coordinates.longitude.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AreaCard;
