
import { Alert } from '@/types/AlertTypes';
import { WeatherData } from '@/types/WeatherTypes';
import { UserReportPattern, ReportRiskFactor } from '@/services/disaster/userReportAnalysisService';
import { predictDisasterRisk } from '@/services/disaster/disasterPredictionAlgorithms';
import { checkProximityToDisasterProneAreas } from '@/services/disaster/geoProximityService';
import { analyzeUserReports, generateReportBasedRiskFactors } from '@/services/disaster/userReportAnalysisService';
import { UnifiedWeatherService } from '@/services/weather/unifiedWeatherService';

export interface AIAnalysisResult {
  alerts: Alert[];
  riskScore: number;
  confidenceLevel: number;
  recommendations: string[];
  userReportPatterns: UserReportPattern[];
  reportRiskFactors: ReportRiskFactor[];
  proximityStatus: any;
  weatherImpact: number;
}

export class AIAnalysisService {
  private static instance: AIAnalysisService;
  private analysisCache = new Map<string, { result: AIAnalysisResult; timestamp: number }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  static getInstance(): AIAnalysisService {
    if (!this.instance) {
      this.instance = new AIAnalysisService();
    }
    return this.instance;
  }

  async performComprehensiveAnalysis(
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<AIAnalysisResult> {
    const cacheKey = `${latitude.toFixed(3)}-${longitude.toFixed(3)}`;
    
    // Check cache first
    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('[AI Analysis Service] Using cached results');
      return cached.result;
    }

    console.log('[AI Analysis Service] Starting comprehensive analysis for:', {
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      accuracy: accuracy ? `${accuracy.toFixed(0)}m` : 'unknown'
    });

    try {
      // Step 1: Get current weather data from OpenWeatherMap API
      const weatherData = UnifiedWeatherService.getCurrentWeatherDataSync();
      
      // Step 2: Analyze proximity to disaster-prone areas
      const proximityStatus = checkProximityToDisasterProneAreas(latitude, longitude, accuracy || 100);
      
      // Step 3: Analyze user reports for patterns
      const userReportPatterns = await analyzeUserReports(latitude, longitude);
      
      // Step 4: Generate report-based risk factors
      const reportRiskFactors = generateReportBasedRiskFactors(userReportPatterns, weatherData);
      
      // Step 5: Run AI disaster prediction algorithms
      const alertWeatherData = {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation || 0,
        windSpeed: weatherData.windSpeed,
        windDirection: weatherData.windDirection || 'Unknown',
        barometricPressure: weatherData.barometricPressure || 1013.25,
        lastUpdated: weatherData.lastUpdated || new Date()
      };
      
      const predictions = predictDisasterRisk(latitude, longitude, alertWeatherData);
      
      // Step 6: Convert predictions to enhanced alerts
      const alerts = this.enhanceAlertsWithAnalysis(predictions, userReportPatterns, reportRiskFactors, proximityStatus);
      
      // Step 7: Calculate overall risk metrics
      const riskScore = this.calculateOverallRiskScore(alerts, proximityStatus, reportRiskFactors);
      const confidenceLevel = this.calculateConfidenceLevel(predictions, userReportPatterns, proximityStatus);
      const weatherImpact = this.calculateWeatherImpact(weatherData, proximityStatus);
      
      // Step 8: Generate comprehensive recommendations
      const recommendations = this.generateRecommendations(alerts, proximityStatus, reportRiskFactors, weatherData);
      
      const result: AIAnalysisResult = {
        alerts,
        riskScore,
        confidenceLevel,
        recommendations,
        userReportPatterns,
        reportRiskFactors,
        proximityStatus,
        weatherImpact
      };

      // Cache the result
      this.analysisCache.set(cacheKey, { result, timestamp: Date.now() });
      
      console.log('[AI Analysis Service] Analysis completed:', {
        alertsGenerated: alerts.length,
        riskScore: riskScore.toFixed(1),
        confidenceLevel: (confidenceLevel * 100).toFixed(1) + '%',
        recommendationsCount: recommendations.length
      });

      return result;
    } catch (error) {
      console.error('[AI Analysis Service] Analysis failed:', error);
      throw new Error(`AI Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private enhanceAlertsWithAnalysis(
    predictions: any[],
    userReportPatterns: UserReportPattern[],
    reportRiskFactors: ReportRiskFactor[],
    proximityStatus: any
  ): Alert[] {
    const alerts: Alert[] = [];

    // Convert predictions to alerts with enhanced data
    predictions.forEach((prediction, index) => {
      const matchingReportRisk = reportRiskFactors.find(risk =>
        risk.riskType.toLowerCase().includes(prediction.predictedDisasterType.toLowerCase())
      );

      const alert: Alert = {
        id: `ai-enhanced-${Date.now()}-${index}`,
        title: `${prediction.alertLevel.toUpperCase()} RISK: ${prediction.predictedDisasterType.toUpperCase()}`,
        description: this.enhanceAlertDescription(prediction, matchingReportRisk, proximityStatus),
        location: proximityStatus?.nearestProneArea?.name || "Your Location",
        severity: prediction.alertLevel as 'high' | 'medium' | 'low',
        date: new Date().toLocaleDateString(),
        isNew: true,
        type: prediction.predictedDisasterType.toLowerCase(),
        aiPredictionScore: prediction.riskScore / 100,
        predictedImpact: prediction.timeframe,
        weatherFactor: prediction.triggeringFactors.find((f: string) =>
          f.includes('rainfall') || f.includes('temperature') || f.includes('humidity')
        ),
        historicalPattern: matchingReportRisk ? 
          `Community reports indicate ${matchingReportRisk.confidence * 100}% likelihood` : undefined,
        isPersonalized: true
      };

      alerts.push(alert);
    });

    // Add proximity-based alerts if in high-risk area
    if (proximityStatus?.insideProneArea && proximityStatus.currentRiskLevel === 'high') {
      alerts.push({
        id: `proximity-alert-${Date.now()}`,
        title: `LOCATION ALERT: HIGH-RISK AREA`,
        description: `You are currently in ${proximityStatus.nearestProneArea?.name}, a known disaster-prone area. ${proximityStatus.proximityAlerts.length} active risk factors detected.`,
        location: proximityStatus.nearestProneArea?.name,
        severity: 'high',
        date: new Date().toLocaleDateString(),
        isNew: true,
        type: 'location_risk',
        aiPredictionScore: 0.9,
        predictedImpact: 'Immediate awareness required',
        isPersonalized: true
      });
    }

    return alerts.sort((a, b) => (b.aiPredictionScore || 0) - (a.aiPredictionScore || 0));
  }

  private enhanceAlertDescription(prediction: any, reportRisk?: ReportRiskFactor, proximityStatus?: any): string {
    let description = prediction.triggeringFactors.join('. ');
    
    if (reportRisk) {
      description += `. Community analysis: ${reportRisk.description}`;
    }
    
    if (proximityStatus?.insideProneArea) {
      description += `. You are currently in ${proximityStatus.nearestProneArea?.name}, which increases risk level.`;
    }
    
    return description;
  }

  private calculateOverallRiskScore(alerts: Alert[], proximityStatus: any, reportRiskFactors: ReportRiskFactor[]): number {
    if (alerts.length === 0) return 0;

    const alertScores = alerts.map(alert => (alert.aiPredictionScore || 0) * 100);
    const maxAlertScore = Math.max(...alertScores);
    
    let adjustedScore = maxAlertScore;
    
    // Proximity adjustment
    if (proximityStatus?.insideProneArea) {
      const proximityBonus = proximityStatus.currentRiskLevel === 'high' ? 20 : 
                           proximityStatus.currentRiskLevel === 'medium' ? 10 : 5;
      adjustedScore += proximityBonus;
    }
    
    // Community reports adjustment
    const highConfidenceReports = reportRiskFactors.filter(risk => risk.confidence > 0.7);
    adjustedScore += highConfidenceReports.length * 5;
    
    return Math.min(adjustedScore, 100);
  }

  private calculateConfidenceLevel(predictions: any[], userReportPatterns: UserReportPattern[], proximityStatus: any): number {
    if (predictions.length === 0) return 0;

    const avgPredictionConfidence = predictions.reduce((sum, p) => sum + p.confidenceLevel, 0) / predictions.length;
    
    let adjustedConfidence = avgPredictionConfidence;
    
    // Boost confidence if we have user reports
    if (userReportPatterns.length > 0) {
      adjustedConfidence += 0.1;
    }
    
    // Boost confidence if in known risk area
    if (proximityStatus?.insideProneArea) {
      adjustedConfidence += 0.15;
    }
    
    return Math.min(adjustedConfidence, 1.0);
  }

  private calculateWeatherImpact(weatherData: any, proximityStatus: any): number {
    let impact = 0;
    
    // Temperature impact
    if (weatherData.temperature > 32) impact += 20;
    else if (weatherData.temperature < 15) impact += 10;
    
    // Precipitation impact
    if (weatherData.precipitation > 20) impact += 30;
    else if (weatherData.precipitation > 10) impact += 15;
    
    // Humidity impact
    if (weatherData.humidity > 85) impact += 15;
    else if (weatherData.humidity < 30) impact += 10;
    
    // Wind impact
    if (weatherData.windSpeed > 25) impact += 20;
    
    // Location amplification
    if (proximityStatus?.insideProneArea) {
      impact *= 1.5;
    }
    
    return Math.min(impact, 100);
  }

  private generateRecommendations(
    alerts: Alert[],
    proximityStatus: any,
    reportRiskFactors: ReportRiskFactor[],
    weatherData: any
  ): string[] {
    const recommendations = new Set<string>();

    // Alert-based recommendations
    alerts.forEach(alert => {
      if (alert.severity === 'high') {
        recommendations.add('Take immediate protective action based on the high-risk alert');
        recommendations.add('Stay informed about rapidly changing conditions');
      }
      
      if (alert.type?.includes('flood')) {
        recommendations.add('Avoid low-lying areas and flooded roads');
        recommendations.add('Move to higher ground if necessary');
      }
      
      if (alert.type?.includes('landslide')) {
        recommendations.add('Stay away from steep slopes and hillsides');
        recommendations.add('Watch for signs of ground movement');
      }
      
      if (alert.type?.includes('fire')) {
        recommendations.add('Be cautious with any open flames or electrical equipment');
        recommendations.add('Keep emergency contact numbers readily available');
      }
    });

    // Proximity-based recommendations
    if (proximityStatus?.insideProneArea) {
      recommendations.add(`You are in ${proximityStatus.nearestProneArea?.name} - stay alert to local conditions`);
      recommendations.add('Have an evacuation plan ready');
    }

    // Weather-based recommendations
    if (weatherData.precipitation > 15) {
      recommendations.add('Carry an umbrella and avoid unnecessary travel');
    }
    
    if (weatherData.temperature > 30) {
      recommendations.add('Stay hydrated and limit outdoor activities during peak hours');
    }

    // Community report recommendations
    if (reportRiskFactors.length > 0) {
      recommendations.add('Monitor community reports for evolving conditions');
      recommendations.add('Report any concerning observations to local authorities');
    }

    // Default recommendations
    if (recommendations.size === 0) {
      recommendations.add('Monitor weather conditions and stay alert');
      recommendations.add('Keep emergency contacts and supplies accessible');
    }

    return Array.from(recommendations).slice(0, 8); // Limit to 8 recommendations
  }

  clearCache(): void {
    this.analysisCache.clear();
    console.log('[AI Analysis Service] Cache cleared');
  }
}

export const aiAnalysisService = AIAnalysisService.getInstance();
