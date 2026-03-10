
import { useState, useEffect, useCallback } from 'react';
import { useUserLocation } from '@/contexts/LocationContext';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { WeatherDataProcessor } from '@/services/weather/weatherDataProcessor';
import { findNearbyRiskAreas, calculateDistance } from '@/services/disaster/locationUtils';
import { disasterProneAreas } from '@/services/disaster/disasterProneAreasData';
import { supabase } from '@/integrations/supabase/client';

export interface RiskPrediction {
  type: string;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  score: number; // 0-100
  confidence: number; // 0-1
  timeframe: string;
  triggers: string[];
  actions: string[];
  icon: string;
}

export interface DisasterRiskData {
  overallRisk: 'critical' | 'high' | 'moderate' | 'low';
  overallScore: number;
  predictions: RiskPrediction[];
  nearbyZones: Array<{
    name: string;
    distance: number;
    vulnerabilityLevel: string;
    risks: string[];
  }>;
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
  } | null;
  communityReports: {
    total: number;
    recent24h: number;
    topType: string;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  lastUpdated: Date | null;
}

const ICON_MAP: Record<string, string> = {
  flooding: '🌊',
  flood: '🌊',
  landslide: '⛰️',
  mudslide: '⛰️',
  'fire outbreak': '🔥',
  'disease outbreak': '🦠',
  'storm surge': '🌪️',
  erosion: '🏔️',
  'coastal erosion': '🏖️',
  'industrial hazards': '🏭',
  default: '⚠️',
};

export function useDisasterRiskAnalysis() {
  const { latitude, longitude, isLoading: locationLoading } = useUserLocation();
  const [data, setData] = useState<DisasterRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analyze = useCallback(async () => {
    if (!latitude || !longitude) return;

    setIsLoading(true);
    setError(null);
    setProgress(5);

    try {
      // Step 1: Identify nearby disaster-prone zones
      setProgress(15);
      const nearbyRiskAreas = findNearbyRiskAreas(latitude, longitude, 15);
      const nearbyDisasterAreas = disasterProneAreas
        .map(area => ({
          ...area,
          distance: calculateDistance(latitude, longitude, area.coordinates.latitude, area.coordinates.longitude),
        }))
        .filter(a => a.distance <= 20)
        .sort((a, b) => a.distance - b.distance);

      // Step 2: Fetch real-time weather
      setProgress(30);
      let weather: DisasterRiskData['weather'] = null;
      try {
        const apiData = await WeatherApiService.fetchWeatherData(latitude, longitude);
        const processed = WeatherDataProcessor.processWeatherData(apiData);
        weather = {
          temperature: processed.current.temperature,
          humidity: processed.current.humidity,
          precipitation: processed.current.precipitation || 0,
          windSpeed: processed.current.windSpeed,
          conditions: processed.current.conditions,
        };
      } catch {
        console.warn('[DisasterRisk] Weather fetch failed, using defaults');
      }

      // Step 3: Fetch community reports
      setProgress(50);
      let communityReports: DisasterRiskData['communityReports'] = {
        total: 0, recent24h: 0, topType: 'none', trend: 'stable',
      };
      try {
        const sinceISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: reports } = await supabase
          .from('reports')
          .select('id, issue_type, created_at')
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false })
          .limit(200);

        if (reports?.length) {
          const last24 = Date.now() - 24 * 60 * 60 * 1000;
          const last48 = Date.now() - 48 * 60 * 60 * 1000;
          const recent = reports.filter(r => new Date(r.created_at!).getTime() >= last24);
          const prev = reports.filter(r => {
            const ts = new Date(r.created_at!).getTime();
            return ts >= last48 && ts < last24;
          });

          const typeCounts: Record<string, number> = {};
          reports.forEach(r => { typeCounts[r.issue_type] = (typeCounts[r.issue_type] || 0) + 1; });
          const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

          communityReports = {
            total: reports.length,
            recent24h: recent.length,
            topType,
            trend: recent.length > prev.length ? 'increasing' : recent.length < prev.length ? 'decreasing' : 'stable',
          };
        }
      } catch {
        console.warn('[DisasterRisk] Community reports fetch failed');
      }

      // Step 4: AI Risk Prediction
      setProgress(70);
      const predictions: RiskPrediction[] = [];
      const currentMonth = new Date().getMonth();
      const isRainySeason = currentMonth >= 4 && currentMonth <= 9;

      // Collect all unique risks from nearby areas
      const allRisks = new Set<string>();
      nearbyDisasterAreas.forEach(area => area.risks.forEach(r => allRisks.add(r)));
      nearbyRiskAreas.forEach(area => area.risks.forEach(r => allRisks.add(r)));

      // Analyze each risk type
      allRisks.forEach(riskType => {
        let score = 0;
        const triggers: string[] = [];
        const actions: string[] = [];
        const relevantAreas = nearbyDisasterAreas.filter(a => a.risks.includes(riskType));
        const closestArea = relevantAreas[0];

        if (!closestArea) return;

        // Proximity factor — closer = higher risk
        const proximityFactor = Math.max(0, 1 - closestArea.distance / 20);
        score += proximityFactor * 25;
        triggers.push(`${closestArea.name} is ${closestArea.distance.toFixed(1)}km away`);

        // Historical events factor
        const historicalEvents = closestArea.historicalEvents?.filter(e => e.type === riskType || e.type.includes(riskType.split(' ')[0])) || [];
        if (historicalEvents.length > 0) {
          score += Math.min(historicalEvents.length * 8, 20);
          const recentEvent = historicalEvents.sort((a, b) => b.year - a.year)[0];
          triggers.push(`Last ${riskType} event: ${recentEvent.year} (${recentEvent.severity} severity)`);
        }

        // Weather-driven risk factors
        if (weather) {
          if (riskType.includes('flood') || riskType === 'storm surge' || riskType === 'poor drainage') {
            if (weather.precipitation > 10) {
              score += Math.min(weather.precipitation * 1.5, 30);
              triggers.push(`Heavy rainfall: ${weather.precipitation.toFixed(1)}mm`);
            }
            if (weather.humidity > 80) {
              score += (weather.humidity - 80) * 0.5;
              triggers.push(`High humidity: ${weather.humidity}%`);
            }
            if (isRainySeason) {
              score += 10;
              triggers.push('Active rainy season');
            }
            actions.push('Move to higher ground if water rises', 'Avoid walking through floodwater', 'Prepare emergency kit');
          }

          if (riskType.includes('landslide') || riskType.includes('mudslide') || riskType.includes('erosion')) {
            if (weather.precipitation > 15) {
              score += Math.min(weather.precipitation * 2, 35);
              triggers.push(`Sustained rainfall: ${weather.precipitation.toFixed(1)}mm`);
            }
            if (isRainySeason) {
              score += 12;
              triggers.push('Soil saturation risk (rainy season)');
            }
            actions.push('Avoid hillside slopes', 'Watch for ground cracks', 'Evacuate if soil shifts');
          }

          if (riskType.includes('fire')) {
            if (weather.temperature > 32) {
              score += (weather.temperature - 32) * 4;
              triggers.push(`High temperature: ${weather.temperature.toFixed(1)}°C`);
            }
            if (weather.humidity < 50) {
              score += (50 - weather.humidity) * 0.8;
              triggers.push(`Low humidity: ${weather.humidity}%`);
            }
            if (weather.windSpeed > 15) {
              score += (weather.windSpeed - 15) * 1.5;
              triggers.push(`Strong winds: ${weather.windSpeed.toFixed(1)} km/h`);
            }
            if (!isRainySeason) {
              score += 10;
              triggers.push('Dry season increases fire risk');
            }
            actions.push('Keep fire extinguisher nearby', 'Report smoke immediately', 'Know your evacuation route');
          }

          if (riskType.includes('disease')) {
            if (weather.temperature > 28 && weather.humidity > 70) {
              score += 20;
              triggers.push(`Warm & humid: ${weather.temperature.toFixed(1)}°C, ${weather.humidity}%`);
            }
            if (weather.precipitation > 5) {
              score += 10;
              triggers.push('Standing water from rain increases breeding');
            }
            actions.push('Use mosquito nets', 'Eliminate standing water', 'Drink treated water');
          }
        }

        // Community reports boost
        if (communityReports.topType.toLowerCase().includes(riskType.split(' ')[0].toLowerCase())) {
          score += 8;
          triggers.push(`${communityReports.recent24h} community reports in 24h`);
        }

        // Vulnerability level boost
        if (closestArea.vulnerabilityLevel === 'high' || closestArea.vulnerabilityLevel === 'critical') {
          score += 10;
        }

        score = Math.min(Math.round(score), 100);
        if (score < 15) return; // Skip negligible risks

        const riskLevel: RiskPrediction['riskLevel'] =
          score >= 75 ? 'critical' :
          score >= 50 ? 'high' :
          score >= 30 ? 'moderate' : 'low';

        const confidence = Math.min(0.5 + (triggers.length * 0.08) + (historicalEvents.length * 0.05), 0.95);

        predictions.push({
          type: riskType,
          riskLevel,
          score,
          confidence,
          timeframe: score >= 75 ? 'Next 6 hours' : score >= 50 ? 'Next 12 hours' : score >= 30 ? 'Next 24 hours' : 'Next 48 hours',
          triggers,
          actions: actions.length ? actions : ['Stay alert', 'Monitor updates', 'Follow local guidance'],
          icon: ICON_MAP[riskType] || ICON_MAP.default,
        });
      });

      // Sort by score descending
      predictions.sort((a, b) => b.score - a.score);

      setProgress(90);

      // Calculate overall risk
      const topScore = predictions[0]?.score || 0;
      const overallRisk: DisasterRiskData['overallRisk'] =
        topScore >= 75 ? 'critical' :
        topScore >= 50 ? 'high' :
        topScore >= 30 ? 'moderate' : 'low';

      const result: DisasterRiskData = {
        overallRisk,
        overallScore: topScore,
        predictions: predictions.slice(0, 5), // Top 5
        nearbyZones: nearbyDisasterAreas.slice(0, 4).map(a => ({
          name: a.name,
          distance: a.distance,
          vulnerabilityLevel: a.vulnerabilityLevel,
          risks: a.risks,
        })),
        weather,
        communityReports,
        lastUpdated: new Date(),
      };

      setData(result);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude && longitude && !locationLoading) {
      analyze();
    }
  }, [latitude, longitude, locationLoading, analyze]);

  return { data, isLoading: isLoading || locationLoading, error, progress, refresh: analyze };
}
