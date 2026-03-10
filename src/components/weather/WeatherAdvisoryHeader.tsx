
import React from 'react';
import { CloudSun, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind } from 'lucide-react';

interface WeatherAdvisoryHeaderProps {
  conditions?: string;
}

const WeatherAdvisoryHeader: React.FC<WeatherAdvisoryHeaderProps> = ({ conditions }) => {
  // Choose appropriate icon based on current weather conditions
  const getWeatherIcon = () => {
    if (!conditions) return <CloudSun className="h-5 w-5 text-white" />;
    
    const conditionsLower = conditions.toLowerCase();
    
    if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return <CloudRain className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('snow')) {
      return <CloudSnow className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('storm')) {
      return <CloudLightning className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('fog') || conditionsLower.includes('mist')) {
      return <CloudFog className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('cloud')) {
      return <Cloud className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) {
      return <Sun className="h-5 w-5 text-white" />;
    } else if (conditionsLower.includes('wind')) {
      return <Wind className="h-5 w-5 text-white" />;
    }
    
    // Default icon
    return <CloudSun className="h-5 w-5 text-white" />;
  };

  return (
    <div className="flex items-center">
      <div className="rounded-full bg-white/20 p-2 mr-2">
        {getWeatherIcon()}
      </div>
      <h3 className="font-semibold text-white text-lg">
        Weather Advisory
      </h3>
    </div>
  );
};

export default WeatherAdvisoryHeader;
