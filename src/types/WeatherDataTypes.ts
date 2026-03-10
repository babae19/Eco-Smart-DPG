
export interface WeatherRisk {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
}

export interface WeatherData {
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
