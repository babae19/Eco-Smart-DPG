
import { create } from 'zustand';
import { TemperatureUnit } from '@/types/WeatherTypes';

interface WeatherState {
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  temperatureUnit: 'celsius',
  setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
}));
