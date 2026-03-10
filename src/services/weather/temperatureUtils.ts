
import { TemperatureUnit } from '@/types/WeatherTypes';

export const convertTemperature = (value: number, unit: TemperatureUnit): number => {
  if (unit === 'fahrenheit') {
    return Math.round((value * 9/5) + 32);
  }
  return Math.round(value);
};

export const formatTemperature = (value: number, unit: TemperatureUnit): string => {
  const convertedValue = convertTemperature(value, unit);
  return `${convertedValue}°${getTemperatureSymbol(unit)}`;
};

export const getTemperatureSymbol = (unit: TemperatureUnit): string => {
  return unit === 'celsius' ? 'C' : 'F';
};
