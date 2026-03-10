
import React from 'react';
import { AlertTriangle, CloudRain, Thermometer, RefreshCw, ArrowUp, Wind, Droplets, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherData, WeatherRisk } from '@/types/WeatherDataTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface GeneralWeatherWarningProps {
  weatherData: WeatherData;
  onRefresh: () => void;
}

const GeneralWeatherWarning: React.FC<GeneralWeatherWarningProps> = ({ weatherData, onRefresh }) => {
  if (!weatherData) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500 mb-3">No weather data available</p>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    );
  }
  
  const { current, riskAnalysis } = weatherData;
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  // Get icon based on risk type
  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'heat':
      case 'extreme_heat':
        return <Thermometer className="h-5 w-5" />;
      case 'rain':
      case 'flooding':
        return <CloudRain className="h-5 w-5" />;
      case 'uv':
        return <Sun className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-blue-800">Current Conditions</h3>
          <Badge variant="outline" className="bg-blue-50">
            {current.conditions}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center p-2 bg-blue-50 rounded-lg">
            <Thermometer className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm">{current.temperature.toFixed(1)}°C</span>
          </div>
          
          <div className="flex items-center p-2 bg-blue-50 rounded-lg">
            <Wind className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm">{current.windSpeed} km/h</span>
          </div>
          
          <div className="flex items-center p-2 bg-blue-50 rounded-lg">
            <Droplets className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm">{current.humidity}% humidity</span>
          </div>
          
          <div className="flex items-center p-2 bg-blue-50 rounded-lg">
            <Sun className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm">UV: {current.uvIndex !== null ? current.uvIndex.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {riskAnalysis && riskAnalysis.risks.length > 0 ? (
        <>
          <div className="mb-3">
            <h3 className="font-medium text-blue-800 mb-2">Risk Assessment</h3>
            
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Risk Level</span>
                <Badge variant={riskAnalysis.riskLevel === 'high' ? 'destructive' : riskAnalysis.riskLevel === 'medium' ? 'default' : 'outline'}>
                  {riskAnalysis.riskLevel}
                </Badge>
              </div>
              <Progress 
                value={riskAnalysis.riskLevel === 'high' ? 90 : riskAnalysis.riskLevel === 'medium' ? 50 : 20} 
                className="h-2" 
                indicatorClassName={
                  riskAnalysis.riskLevel === 'high' ? 'bg-red-500' : 
                  riskAnalysis.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                }
              />
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{riskAnalysis.summary}</p>
          </div>
          
          <div className="space-y-2">
            {riskAnalysis.risks.map((risk: WeatherRisk, index) => (
              <Alert key={index} className={`${getSeverityColor(risk.severity)}`}>
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {getRiskIcon(risk.type)}
                  </div>
                  <div>
                    <AlertTitle className="mb-1">{risk.description}</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {risk.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-800">No Weather Risks Detected</h3>
          </div>
          <p className="text-sm text-green-700">
            Current weather conditions don't indicate any significant risks.
            Continue with normal activities while staying aware of changing conditions.
          </p>
        </div>
      )}
      
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Update Weather Data
        </Button>
      </div>
    </div>
  );
};

export default GeneralWeatherWarning;
