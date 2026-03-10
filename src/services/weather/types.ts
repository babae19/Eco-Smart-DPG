
export interface WeatherPrediction {
  date: string;
  prediction: string;
  severity: 'high' | 'medium' | 'low';
  probability: number;
  aiConfidence: number;
}

export interface FloodingData {
  historicalEvents: {
    date: string;
    description: string;
    severity: string;
  }[];
  riskZones: string[];
  safetyTips: string[];
}

export interface LocationWeatherAlert {
  currentWeather: {
    temperature: number;
    conditions: string;
    rainProbability: number;
    humidity: number;
    windSpeed: number;
    lastUpdated: string;
  };
  predictions: WeatherPrediction[];
  floodingData: FloodingData;
  userSpecificRisk: {
    riskLevel: 'critical' | 'high' | 'moderate' | 'low';
    riskFactors: string[];
    safetyRecommendations: string[];
  };
  dataSource: string;
}
