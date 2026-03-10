
import React from 'react';
import { useWeatherStore } from '@/services/weather/globalWeatherState';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Thermometer } from 'lucide-react';
import { TemperatureUnit } from '@/types/WeatherTypes';
import { cn } from '@/lib/utils';

const TemperatureUnitToggle: React.FC = () => {
  const { temperatureUnit, setTemperatureUnit } = useWeatherStore();

  const handleToggle = (value: string) => {
    if (value === 'celsius' || value === 'fahrenheit') {
      setTemperatureUnit(value as TemperatureUnit);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Thermometer size={16} className={cn("text-blue-500")} />
      <ToggleGroup 
        type="single" 
        value={temperatureUnit}
        onValueChange={handleToggle}
        size="sm"
        variant="outline"
      >
        <ToggleGroupItem value="celsius" aria-label="Celsius">
          °C
        </ToggleGroupItem>
        <ToggleGroupItem value="fahrenheit" aria-label="Fahrenheit">
          °F
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TemperatureUnitToggle;
