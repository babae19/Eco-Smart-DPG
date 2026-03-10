export interface WeatherData {
  latitude: number;
  longitude: number;
  generatedAt: string;
  weatherDetails: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    conditions: string;
    precipitation?: number;
    uvIndex?: number;
    pressure?: number;
  };
}

export interface ProximityStatus {
  distance: number;
  currentRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  lastUpdated: string;
}

export interface MobileCapabilities {
  hasPushNotifications: boolean;
  hasGeolocation: boolean;
  hasVibration: boolean;
  networkType: string;
  isOnline: boolean;
}

export interface AIAnalysisResult {
  alerts: any[];
  isAnalyzing: boolean;
  progress: number;
  recommendations: string[];
  userReportPatterns: any[];
  reportRiskFactors: any[];
  analysisComplete: boolean;
  refreshAnalysis: () => void;
  riskScore: number;
  confidenceLevel: number;
  proximityStatus: ProximityStatus;
  weatherImpact: number;
  error?: string;
}

export interface DbCampaign {
  id: string;
  title: string;
  goal: string;
  end_date: string;
  image_url?: string;
  created_at: string;
  created_by: string;
  supporters: number;
  status: string;
  description?: string;
}

export interface ErrorMetadata {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface RealtimeDisasterAlert {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  location: string;
  coordinates: any;
  probability: number;
  timeframe: string;
  precautions: string[];
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  weather_data: WeatherData | null;
}