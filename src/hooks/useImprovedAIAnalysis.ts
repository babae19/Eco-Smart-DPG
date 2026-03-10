
import { useState, useEffect, useCallback } from 'react';
import { Alert } from '@/types/AlertTypes';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { WeatherDataProcessor } from '@/services/weather/weatherDataProcessor';
import { supabase } from '@/integrations/supabase/client';
import { GoogleGeocodingService } from '@/services/geolocation/googleGeocodingService';

interface UseImprovedAIAnalysisProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  enabled?: boolean;
}

interface AIAnalysisResult {
  alerts: Alert[];
  riskScore: number;
  confidenceLevel: number;
  recommendations: string[];
  userReportPatterns: string[];
  reportRiskFactors: string[];
  proximityStatus: import('@/types/SupabaseTypes').ProximityStatus;
  weatherImpact: { riskScore: number };
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
  analysisComplete: boolean;
  refreshAnalysis: () => Promise<void>;
  clearCache: () => void;
}

export const useImprovedAIAnalysis = ({
  latitude,
  longitude,
  accuracy,
  enabled = true
}: UseImprovedAIAnalysisProps): AIAnalysisResult => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userReportPatterns, setUserReportPatterns] = useState<string[]>([]);
  const [reportRiskFactors, setReportRiskFactors] = useState<string[]>([]);
  const [proximityStatus, setProximityStatus] = useState(null);
  const [weatherImpact, setWeatherImpact] = useState({ riskScore: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const refreshAnalysis = useCallback(async () => {
    if (!enabled || !latitude || !longitude) {
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      let reportsBump = 0;
      
      // Step 1: Enhance location accuracy with Google Geocoding API
      setProgress(10);
      const enhancedLocation = await GoogleGeocodingService.validateAndEnhanceCoordinates(
        latitude,
        longitude
      );
      
      const effectiveLat = enhancedLocation.isValid ? enhancedLocation.enhancedLatitude : latitude;
      const effectiveLng = enhancedLocation.isValid ? enhancedLocation.enhancedLongitude : longitude;
      
      console.log('[AI Analysis] Location enhanced:', {
        original: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        enhanced: `${effectiveLat.toFixed(6)}, ${effectiveLng.toFixed(6)}`,
        accuracy: enhancedLocation.accuracyLevel,
        confidence: (enhancedLocation.confidenceScore * 100).toFixed(0) + '%'
      });
      
      // Step 2: Fetch real weather data from OpenWeatherMap API
      setProgress(25);
      const weatherData = await WeatherApiService.fetchWeatherData(effectiveLat, effectiveLng);
      const processedData = WeatherDataProcessor.processWeatherData(weatherData);
      
      setProgress(50);
      
      // AI analysis using real weather data
      const analysisAlerts: Alert[] = [];
      
      // Analyze temperature risks
      if (processedData.current.temperature > 35) {
        analysisAlerts.push({
          id: `ai-temp-${Date.now()}`,
          title: 'AI: Extreme Heat Risk',
          description: `AI analysis indicates extreme heat conditions (${processedData.current.temperature.toFixed(1)}°C). High risk of heat-related health issues.`,
          severity: 'high',
          location: processedData.location,
          date: new Date().toISOString(),
          isPersonalized: true,
          source: 'ai_analysis',
          aiPredictionScore: 0.9,
          isNew: true,
          type: 'temperature',
          weatherData: {
            temperature: processedData.current.temperature,
            humidity: processedData.current.humidity,
            precipitation: processedData.current.precipitation || 0
          }
        });
      }
      
      setProgress(75);
      
      // Analyze weather risks using processed data
      if (processedData.riskAnalysis && processedData.riskAnalysis.risks.length > 0) {
        processedData.riskAnalysis.risks.forEach((risk, index) => {
          analysisAlerts.push({
            id: `ai-risk-${Date.now()}-${index}`,
            title: `AI: ${risk.type.toUpperCase()} Risk Alert`,
            description: `AI analysis: ${risk.description}`,
            severity: risk.severity === 'high' ? 'high' : 
                     risk.severity === 'medium' ? 'medium' : 'low',
            location: processedData.location,
            date: new Date().toISOString(),
            isPersonalized: true,
            source: 'ai_analysis',
            aiPredictionScore: 0.85,
            isNew: true,
            type: risk.type,
            weatherData: {
              temperature: processedData.current.temperature,
              humidity: processedData.current.humidity,
              precipitation: processedData.current.precipitation || 0
            }
          });
        });
      }
      
      // Integrate community reports near user
      try {
        const sinceISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: reportRows } = await supabase
          .from('reports')
          .select('id, issue_type, location, created_at, status')
          .eq('status', 'approved')
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (reportRows && reportRows.length) {
          const parseCoords = (loc?: string) => {
            if (!loc) return null as null | { lat: number; lng: number };
            const m = loc.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
            return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
          };
          const toRad = (v: number) => (v * Math.PI) / 180;
          const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          };
          const withinKm = 50;
          const nearby = reportRows.filter((r: any) => {
            if (!latitude || !longitude) return true;
            const c = parseCoords(r.location);
            if (!c) return false;
            return distanceKm(latitude, longitude, c.lat, c.lng) <= withinKm;
          });
          const nowTs = Date.now();
          const last24 = nowTs - 24 * 60 * 60 * 1000;
          const prev24 = nowTs - 48 * 60 * 60 * 1000;
          const normalize = (t: string) => (t || 'other').toLowerCase();
          const groups: Record<string, any[]> = {};
          nearby.forEach((r: any) => {
            const k = normalize(r.issue_type);
            (groups[k] ||= []).push(r);
          });
          const patterns: string[] = [];
          const factors: string[] = [];
          Object.entries(groups).forEach(([type, list]) => {
            const freq = list.length;
            const recent = list.filter((r: any) => new Date(r.created_at).getTime() >= last24).length;
            const prevRecent = list.filter((r: any) => {
              const ts = new Date(r.created_at).getTime();
              return ts >= prev24 && ts < last24;
            }).length;
            const trend = recent > prevRecent ? 'increasing' : recent < prevRecent ? 'decreasing' : 'stable';
            patterns.push(`${type}: ${freq} reports (7d), ${recent} in 24h, trend ${trend}`);
            factors.push(type);
            if (recent >= 3 || freq >= 5) {
              analysisAlerts.push({
                id: `ai-community-${type}-${Date.now()}`,
                title: `AI: Community ${type} reports`,
                description: `Detected ${recent} ${type} reports in the last 24h near you (total ${freq} in 7 days).`,
                severity: recent >= 5 || freq >= 8 ? 'high' : recent >= 3 || freq >= 5 ? 'medium' : 'low',
                location: processedData.location,
                date: new Date().toISOString(),
                isPersonalized: true,
                source: 'community_reports',
                aiPredictionScore: 0.7,
                isNew: true,
                type,
                weatherData: {
                  temperature: processedData.current.temperature,
                  humidity: processedData.current.humidity,
                  precipitation: processedData.current.precipitation || 0
                }
              });
            }
          });
          if (patterns.length) {
            reportsBump = Math.min(patterns.length * 5, 20);
            setUserReportPatterns(patterns);
            setReportRiskFactors(factors);
          }
        }
      } catch (_) {
        // ignore report analysis errors
      }
      
      setProgress(100);

      setAlerts(analysisAlerts);
      
      // Calculate risk score based on real weather data
      let calculatedRiskScore = 0;
      if (processedData.current.temperature > 35) calculatedRiskScore += 30;
      if (processedData.current.humidity > 85) calculatedRiskScore += 20;
      if (processedData.current.precipitation && processedData.current.precipitation > 20) calculatedRiskScore += 25;
      if (processedData.riskAnalysis?.riskLevel === 'high') calculatedRiskScore += 25;
      
      setRiskScore(Math.min(calculatedRiskScore + reportsBump, 100));
      
      // Adjust confidence based on Google location validation
      const baseConfidence = 0.85;
      const locationConfidenceBoost = enhancedLocation.isValid ? 
        enhancedLocation.confidenceScore * 0.15 : 0; // Up to 15% boost from location accuracy
      setConfidenceLevel(Math.min(baseConfidence + locationConfidenceBoost, 1.0));
      
      // Generate recommendations based on real weather conditions
      const weatherRecommendations = processedData.riskAnalysis?.recommendations || [];
      const baseRecommendations = [
        'Monitor current weather conditions',
        'Stay updated with local weather alerts'
      ];
      
      setRecommendations([...weatherRecommendations, ...baseRecommendations]);
      setUserReportPatterns(['weather-related', 'infrastructure']);
      setReportRiskFactors(['temperature', 'precipitation', 'humidity']);
      setWeatherImpact({ riskScore: calculatedRiskScore });
      setAnalysisComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [latitude, longitude, enabled]);

  const clearCache = useCallback(() => {
    setAlerts([]);
    setAnalysisComplete(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (enabled && latitude && longitude) {
      refreshAnalysis();
    }
  }, [latitude, longitude, enabled]); // Remove refreshAnalysis from deps to prevent infinite loops

  return {
    alerts,
    riskScore,
    confidenceLevel,
    recommendations,
    userReportPatterns,
    reportRiskFactors,
    proximityStatus,
    weatherImpact,
    isAnalyzing,
    progress,
    error,
    analysisComplete,
    refreshAnalysis,
    clearCache
  };
};
