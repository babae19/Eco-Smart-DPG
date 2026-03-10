
export interface DisasterProneArea {
  id: number;
  name: string;
  risks: string[];
  weatherRisks?: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical';
  safetyTips: string[];
  distance?: number; // Optional distance property for proximity calculations
  image?: string; // Optional image URL
  historicalEvents?: Array<{
    type: string;
    year: number;
    severity: 'low' | 'medium' | 'high';
    description?: string;
  }>;
}
