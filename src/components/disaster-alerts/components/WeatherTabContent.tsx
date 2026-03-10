
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { WeatherData } from '@/types/WeatherDataTypes';
import { Cloud, Thermometer, Droplets, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherTabContentProps {
  weatherData: WeatherData | null;
  onRefresh: () => void;
  weatherImpact?: number;
}

const WeatherTabContent: React.FC<WeatherTabContentProps> = ({
  weatherData,
  onRefresh,
  weatherImpact = 0
}) => {
  return (
    <TabsContent value="weather" className="p-4 space-y-3">
      {!weatherData ? (
        <div className="text-center py-6 text-gray-500">
          <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Weather data not available</p>
          <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
            Refresh Weather
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-700">
                <Thermometer className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Temperature</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{weatherData.current.temperature}°C</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <div className="flex items-center text-cyan-700">
                <Droplets className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Humidity</span>
              </div>
              <p className="text-lg font-bold text-cyan-900">{weatherData.current.humidity}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center text-green-700">
                <Wind className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Wind Speed</span>
              </div>
              <p className="text-lg font-bold text-green-900">{weatherData.current.windSpeed} km/h</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center text-purple-700">
                <Cloud className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Conditions</span>
              </div>
              <p className="text-sm font-bold text-purple-900">{weatherData.current.conditions}</p>
            </div>
          </div>
          
          {weatherImpact > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-orange-700">Weather Impact</span>
                <span className="text-sm font-bold text-orange-700">{weatherImpact.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${weatherImpact}%` }}></div>
              </div>
            </div>
          )}
          
          {weatherData.riskAnalysis && weatherData.riskAnalysis.risks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Weather Risks</h4>
              {weatherData.riskAnalysis.risks.map((risk, index) => (
                <div key={index} className={`p-2 rounded border-l-4 mb-2 ${
                  risk.severity === 'high' ? 'bg-red-50 border-red-400' :
                  risk.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <p className="text-xs font-medium">{risk.type}</p>
                  <p className="text-xs text-gray-600">{risk.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </TabsContent>
  );
};

export default WeatherTabContent;
