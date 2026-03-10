
import React from 'react';
import { ShieldAlert, Thermometer, Sun, CloudRain, Cloud, CloudSnow, CloudLightning, CloudFog, Wind } from 'lucide-react';

export interface TemperatureAdvice {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendations: string[];
  weatherConditions?: string;
}

interface WeatherAlertContentProps {
  advice: TemperatureAdvice;
}

const WeatherAlertContent: React.FC<WeatherAlertContentProps> = ({ advice }) => {
  // Determine icon based on severity and weather conditions
  const getIcon = () => {
    if (advice.weatherConditions) {
      const conditions = advice.weatherConditions.toLowerCase();
      
      if (conditions.includes('rain') || conditions.includes('drizzle')) {
        return CloudRain;
      } else if (conditions.includes('snow')) {
        return CloudSnow;
      } else if (conditions.includes('thunder') || conditions.includes('storm')) {
        return CloudLightning;
      } else if (conditions.includes('fog') || conditions.includes('mist')) {
        return CloudFog;
      } else if (conditions.includes('cloud')) {
        return Cloud;
      } else if (conditions.includes('clear') || conditions.includes('sun')) {
        return Sun;
      } else if (conditions.includes('wind')) {
        return Wind;
      }
    }
    
    // Fall back to severity-based icon if no weather condition or unrecognized
    return advice.severity === 'high' ? ShieldAlert : 
           advice.severity === 'medium' ? Thermometer : 
           Cloud;
  };
  
  const Icon = getIcon();
  
  // Determine background color based on severity
  const getBgColor = () => {
    switch(advice.severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-l-red-500';
      case 'medium':
        return 'bg-amber-50 dark:bg-amber-900/20 border-l-amber-500';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500';
    }
  };
  
  return (
    <div className={`rounded-md border-l-4 p-4 ${getBgColor()}`}>
      <div className="flex items-start">
        <div className={`p-1 mr-3 rounded-full ${
          advice.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' : 
          advice.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' : 
          'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          <Icon className={`h-5 w-5 ${
            advice.severity === 'high' ? 'text-red-600 dark:text-red-400' : 
            advice.severity === 'medium' ? 'text-amber-600 dark:text-amber-400' : 
            'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
        
        <div>
          <h4 className={`font-medium text-lg ${
            advice.severity === 'high' ? 'text-red-800 dark:text-red-300' : 
            advice.severity === 'medium' ? 'text-amber-800 dark:text-amber-300' : 
            'text-blue-800 dark:text-blue-300'
          }`}>
            {advice.title}
          </h4>
          
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {advice.description}
          </p>
          
          {advice.weatherConditions && (
            <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              Current conditions: {advice.weatherConditions}
            </p>
          )}
          
          {advice.recommendations && advice.recommendations.length > 0 && (
            <div className="mt-3 bg-white/50 dark:bg-gray-800/50 rounded-md p-3">
              <p className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Recommendations:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {advice.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertContent;
