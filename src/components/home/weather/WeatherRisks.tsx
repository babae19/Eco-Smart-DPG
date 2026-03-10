
import React from 'react';
import { Cloud, CloudRain, CloudLightning, Snowflake, Wind, ThermometerSun, Droplets } from 'lucide-react';

interface WeatherRisksProps {
  risks: string[];
}

const WeatherRisks: React.FC<WeatherRisksProps> = ({ risks }) => {
  if (!risks || risks.length === 0) {
    return <div className="text-sm text-gray-500">No specific weather risks identified.</div>;
  }

  const getRiskIcon = (risk: string) => {
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('rain') || lowerRisk.includes('flood')) {
      return <CloudRain className="text-blue-500" size={16} />;
    } else if (lowerRisk.includes('lightning') || lowerRisk.includes('storm')) {
      return <CloudLightning className="text-purple-500" size={16} />;
    } else if (lowerRisk.includes('snow') || lowerRisk.includes('freeze')) {
      return <Snowflake className="text-blue-300" size={16} />;
    } else if (lowerRisk.includes('wind')) {
      return <Wind className="text-gray-500" size={16} />;
    } else if (lowerRisk.includes('heat') || lowerRisk.includes('temperature')) {
      return <ThermometerSun className="text-orange-500" size={16} />;
    } else if (lowerRisk.includes('humid')) {
      return <Droplets className="text-blue-400" size={16} />;
    } else {
      return <Cloud className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="space-y-2">
      {risks.map((risk, index) => (
        <div key={index} className="flex items-center text-sm">
          <span className="mr-2 flex-shrink-0">{getRiskIcon(risk)}</span>
          <span className="text-gray-700">{risk}</span>
        </div>
      ))}
    </div>
  );
};

export default WeatherRisks;
