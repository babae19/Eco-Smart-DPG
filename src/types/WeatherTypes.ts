
export interface WeatherData {
  day: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'drizzle';
  precipChance: number;
  windDirection?: string;
  precipitation?: number;
  lastUpdated?: Date;
  updated?: boolean;
  temperature: number; // Changed from optional to required to match AlertTypes.WeatherData
  barometricPressure?: number;
  uvIndex?: number;
  feelsLike?: number; // Added feels like temperature
  sunriseTime?: Date;
  sunsetTime?: Date;
  sunrise?: Date; // Added sunrise alias for compatibility
  sunset?: Date; // Added sunset alias for compatibility
}

// Unified weather interface that matches WeatherDataTypes
export interface UnifiedWeatherData {
  location: string;
  current: {
    temperature: number;
    conditions: string;
    humidity: number;
    windSpeed: number;
    windDirection?: string;
    pressure?: number;
    feelsLike: number;
    precipitation?: number;
    uvIndex?: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
  riskAnalysis?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    risks: WeatherRisk[];
    recommendations: string[];
    summary: string;
  };
}

export interface WeatherRisk {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface ClimateMetric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface WeatherAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}
