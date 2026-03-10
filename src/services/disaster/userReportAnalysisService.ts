
import { Alert } from '@/types/AlertTypes';

export interface UserReportPattern {
  reportType: string;
  frequency: number;
  severity: 'high' | 'medium' | 'low';
  location: string;
  recentReports: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  lastReported: string; // Added missing property
}

export interface ReportRiskFactor {
  riskType: string;
  confidence: number;
  description: string;
  timeframe: string;
  source: 'user_reports' | 'historical' | 'weather';
}

// Analyze user reports to identify emerging risk patterns
export const analyzeUserReports = async (latitude: number, longitude: number): Promise<UserReportPattern[]> => {
  try {
    // In a real implementation, this would query the database for recent reports
    // For now, we'll simulate analysis based on common disaster types in Sierra Leone
    
    const patterns: UserReportPattern[] = [];
    
    // Simulate flooding reports analysis
    if (isInFloodProneArea(latitude, longitude)) {
      patterns.push({
        reportType: 'flooding',
        frequency: Math.floor(Math.random() * 10) + 5,
        severity: 'high',
        location: getLocationName(latitude, longitude),
        recentReports: Math.floor(Math.random() * 5) + 2,
        trendDirection: 'increasing',
        lastReported: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Simulate landslide reports analysis
    if (isInHillyArea(latitude, longitude)) {
      patterns.push({
        reportType: 'landslide',
        frequency: Math.floor(Math.random() * 8) + 3,
        severity: 'medium',
        location: getLocationName(latitude, longitude),
        recentReports: Math.floor(Math.random() * 3) + 1,
        trendDirection: 'stable',
        lastReported: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Simulate fire outbreak reports
    patterns.push({
      reportType: 'fire outbreak',
      frequency: Math.floor(Math.random() * 6) + 2,
      severity: 'medium',
      location: getLocationName(latitude, longitude),
      recentReports: Math.floor(Math.random() * 2),
      trendDirection: 'stable',
      lastReported: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString()
    });
    
    return patterns;
  } catch (error) {
    console.error('Error analyzing user reports:', error);
    return [];
  }
};

// Generate risk factors based on user report analysis
export const generateReportBasedRiskFactors = (patterns: UserReportPattern[], weatherData: any): ReportRiskFactor[] => {
  const riskFactors: ReportRiskFactor[] = [];
  
  patterns.forEach(pattern => {
    if (pattern.recentReports > 2 || pattern.trendDirection === 'increasing') {
      let confidence = 0.6;
      
      // Increase confidence if weather conditions align with report patterns
      if (pattern.reportType === 'flooding' && weatherData?.precipitation > 20) {
        confidence += 0.2;
      } else if (pattern.reportType === 'landslide' && weatherData?.precipitation > 25) {
        confidence += 0.25;
      } else if (pattern.reportType === 'fire outbreak' && weatherData?.temperature > 32) {
        confidence += 0.15;
      }
      
      riskFactors.push({
        riskType: pattern.reportType,
        confidence: Math.min(confidence, 0.95),
        description: `Community reports indicate ${pattern.recentReports} recent ${pattern.reportType} incidents in ${pattern.location}`,
        timeframe: pattern.trendDirection === 'increasing' ? 'immediate concern' : 'next 48 hours',
        source: 'user_reports'
      });
    }
  });
  
  return riskFactors;
};

// Helper functions
const isInFloodProneArea = (lat: number, lng: number): boolean => {
  // Check if coordinates are in known flood-prone areas of Freetown
  return (
    (lat > 8.47 && lat < 8.49 && lng > -13.24 && lng < -13.22) || // Kroo Bay
    (lat > 8.48 && lat < 8.50 && lng > -13.22 && lng < -13.20)    // Susan's Bay
  );
};

const isInHillyArea = (lat: number, lng: number): boolean => {
  // Check if coordinates are in hilly/landslide-prone areas
  return (
    (lat > 8.39 && lat < 8.41 && lng > -13.21 && lng < -13.20) || // Regent area
    (lat > 8.44 && lat < 8.45 && lng > -13.24 && lng < -13.23)    // Hill Station
  );
};

const getLocationName = (lat: number, lng: number): string => {
  if (isInFloodProneArea(lat, lng)) {
    return lat > 8.485 ? "Susan's Bay area" : "Kroo Bay area";
  } else if (isInHillyArea(lat, lng)) {
    return lat < 8.40 ? "Regent area" : "Hill Station area";
  }
  return "Freetown area";
};
