
import React, { useMemo } from 'react';
import { MapPin, AlertTriangle, ShieldAlert } from 'lucide-react';
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import WeatherRisks from '../weather/WeatherRisks';
import { getDisasterImage } from '@/services/weather/weatherIconUtils';

interface AreaDetailsProps {
  area: DisasterProneArea;
}

// Extracted to a separate function for memoization
const getRiskColor = (risk: string) => {
  if (risk.toLowerCase().includes('flood')) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
  if (risk.toLowerCase().includes('landslide')) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30';
  if (risk.toLowerCase().includes('fire')) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
  if (risk.toLowerCase().includes('disease')) return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30';
  if (risk.toLowerCase().includes('coast')) return 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30';
  return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
};

const RiskBadge = React.memo(({ risk }: { risk: string }) => (
  <div 
    className={`px-2.5 py-1 rounded-full text-sm flex items-center ${getRiskColor(risk)}`}
  >
    <AlertTriangle size={14} className="mr-1.5" />
    {risk}
  </div>
));

const SafetyTip = React.memo(({ tip }: { tip: string }) => (
  <li className="text-sm text-green-700 dark:text-green-400 flex items-start">
    <span className="mr-2 mt-0.5 text-green-500 dark:text-green-400">•</span>
    <span>{tip}</span>
  </li>
));

const AreaDetails: React.FC<AreaDetailsProps> = ({ area }) => {
  // Get the primary risk type for the area
  const primaryRisk = useMemo(() => 
    area.risks && area.risks.length > 0 ? area.risks[0] : 'Unknown', 
  [area.risks]);
  
  // Get the appropriate disaster image based on risks and area name
  const areaImage = useMemo(() => 
    getDisasterImage(primaryRisk, area.name),
  [primaryRisk, area.name]);

  const riskBadges = useMemo(() => 
    area.risks.map((risk, idx) => <RiskBadge key={idx} risk={risk} />),
  [area.risks]);
  
  const safetyTips = useMemo(() => 
    area.safetyTips?.map((tip, index) => <SafetyTip key={index} tip={tip} />),
  [area.safetyTips]);

  return (
    <div className="space-y-4 my-2 overflow-y-auto pr-2 max-h-[60vh] hide-scrollbar">
      <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Hero image area */}
        <div className="h-48 relative bg-gray-50 dark:bg-gray-900">
          <img 
            src={areaImage}
            alt={`${area.name} - ${primaryRisk}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white z-10">
            <h3 className="font-semibold text-xl">{area.name}</h3>
            <div className="flex items-center mt-1 text-sm opacity-90">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span>
                {area.coordinates.latitude.toFixed(4)}, {area.coordinates.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-4">
          {/* Risk badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {riskBadges}
          </div>
          
          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-4">{area.description}</p>
          
          {/* Weather Risks Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Weather-Related Risks:</h4>
            <WeatherRisks risks={area.weatherRisks} />
          </div>
          
          {/* Safety Tips Section */}
          {area.safetyTips && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-900/30 mt-4">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center">
                <ShieldAlert size={16} className="mr-1.5" />
                Safety Tips
              </h3>
              <ul className="mt-2 space-y-2">
                {safetyTips}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AreaDetails);
