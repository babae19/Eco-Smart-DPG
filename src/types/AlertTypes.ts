export interface Alert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  isNew?: boolean;
  type?: string;
  aiPredictionScore?: number;
  predictedImpact?: string;
  historicalPattern?: string;
  weatherFactor?: string;
  weatherData?: {
    temperature: number;
    humidity: number;
    precipitation: number;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPersonalized?: boolean;
  source?: string;
}

export interface WeatherAlert {
  id: string; 
  type: 'temperature' | 'precipitation' | 'disaster-prone';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  weatherData: {
    temperature: number;
    humidity: number;
    precipitation: number;
  };
  location: string;
  timestamp: Date;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation?: number; // Making precipitation optional to match WeatherTypes
  windSpeed: number;
  windDirection: string;
  barometricPressure: number;
  lastUpdated: Date;
  isFreetownAlert?: boolean;
}

export interface HistoricalDisasterData {
  disasterType: string;
  frequency: number;
  lastOccurrence: string;
  severity: 'high' | 'medium' | 'low';
  location: string;
  casualties?: number;
  economicImpact?: string;
}

export interface AIAlertPrediction {
  riskScore: number;
  confidenceLevel: number;
  predictedDisasterType: string;
  timeframe: string;
  recommendedActions: string[];
  alertLevel: 'high' | 'medium' | 'low';
  triggeringFactors: string[];
  location?: string;
  historicalPattern?: string;
}
