
import { useImprovedAIAnalysis } from '@/hooks/useImprovedAIAnalysis';

interface UseEnhancedAlertAnalysisProps {
  latitude?: number;
  longitude?: number;
}

export function useEnhancedAlertAnalysis({ latitude, longitude }: UseEnhancedAlertAnalysisProps) {
  const analysisResult = useImprovedAIAnalysis({
    latitude,
    longitude,
    enabled: !!(latitude && longitude)
  });

  // Map the improved analysis results to the expected interface
  return {
    alerts: analysisResult.alerts,
    isAnalyzing: analysisResult.isAnalyzing,
    progress: analysisResult.progress,
    safetyRecommendations: analysisResult.recommendations,
    userReportPatterns: analysisResult.userReportPatterns,
    reportRiskFactors: analysisResult.reportRiskFactors,
    analysisComplete: analysisResult.analysisComplete,
    refreshAnalysis: analysisResult.refreshAnalysis,
    
    // Additional enhanced properties
    riskScore: analysisResult.riskScore,
    confidenceLevel: analysisResult.confidenceLevel,
    proximityStatus: analysisResult.proximityStatus,
    weatherImpact: analysisResult.weatherImpact,
    error: analysisResult.error
  };
}
