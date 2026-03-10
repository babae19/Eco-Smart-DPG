
import React from 'react';
import { CheckCircle, RefreshCw, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedWeatherService } from '@/services/weather/unifiedWeatherService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NoAlertsStateProps {
  onRefresh: () => void;
}

const NoAlertsState: React.FC<NoAlertsStateProps> = ({ onRefresh }) => {
  // Get current weather data to provide context
  const weatherData = UnifiedWeatherService.getCurrentWeatherDataSync();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "text-center py-8 px-6 rounded-lg border shadow-sm",
        "bg-gradient-to-r from-green-50 via-blue-50 to-green-50"
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 items-center justify-center mb-4"
      >
        <CheckCircle className="h-8 w-8 text-green-600" />
      </motion.div>
      
      <h3 className="text-xl font-medium text-green-800 mb-3">No Current Risks Detected</h3>
      
      <p className="text-md text-blue-700 mb-4 max-w-lg mx-auto">
        Our AI analysis indicates no significant disaster risks in your area at this time. 
        We'll continue to monitor conditions and alert you if anything changes.
      </p>
      
      {/* Current Weather Snapshot */}
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-6 max-w-md mx-auto">
        <div className="flex items-center justify-center mb-2">
          <CloudSun className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-800">Current Conditions</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded">
            <span className="text-blue-700">Temperature</span>
            <div className="font-semibold text-blue-900">{weatherData.temperature.toFixed(1)}°C</div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-2 rounded">
            <span className="text-teal-700">Humidity</span>
            <div className="font-semibold text-teal-900">{weatherData.humidity.toFixed(0)}%</div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 rounded">
            <span className="text-indigo-700">Precipitation</span>
            <div className="font-semibold text-indigo-900">{weatherData.precipitation.toFixed(1)} mm</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded">
            <span className="text-purple-700">Wind</span>
            <div className="font-semibold text-purple-900">{weatherData.windSpeed.toFixed(1)} km/h {weatherData.windDirection}</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {weatherData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>
      
      <Button 
        variant="default"
        size="default"
        onClick={onRefresh}
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-md"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Analysis
      </Button>
    </motion.div>
  );
};

export default NoAlertsState;
