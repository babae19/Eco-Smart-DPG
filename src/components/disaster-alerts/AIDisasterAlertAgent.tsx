
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useUserLocation } from '@/contexts/LocationContext';
import { useImprovedAIAnalysis } from '@/hooks/useImprovedAIAnalysis';
import { useWeatherData } from '@/hooks/useWeatherData';
import { WeatherData } from '@/types/WeatherDataTypes';
import { ReportRiskFactor } from '@/services/disaster/userReportAnalysisService';
import { UserReportPattern as ServiceUserReportPattern } from '@/services/disaster/userReportAnalysisService';

// Import the focused components
import AIDisasterAlertAgentHeader from './components/AIDisasterAlertAgentHeader';
import AIDisasterAlertAgentTabs from './components/AIDisasterAlertAgentTabs';
import AIRisksTabContent from './components/AIRisksTabContent';
import CommunityReportsTabContent from './components/CommunityReportsTabContent';
import WeatherTabContent from './components/WeatherTabContent';
import SafetyTabContent from './components/SafetyTabContent';
import AIDisasterAlertAgentFooter from './components/AIDisasterAlertAgentFooter';
import AlertAnalyzing from './components/AlertAnalyzing';
import LocationLoading from './components/LocationLoading';
import LocationRequired from './components/LocationRequired';

interface AIDisasterAlertAgentProps {
  className?: string;
}

const AIDisasterAlertAgent: React.FC<AIDisasterAlertAgentProps> = ({ className }) => {
  const { latitude, longitude, accuracy, isLoading: locationLoading } = useUserLocation();
  
  const { 
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
  } = useImprovedAIAnalysis({ 
    latitude, 
    longitude, 
    accuracy,
    enabled: !locationLoading 
  });
  
  const { 
    weatherData, 
    isLoading: weatherLoading, 
    refreshWeatherData 
  } = useWeatherData();
  
  const [activeTab, setActiveTab] = React.useState<string>("risks");
  
  React.useEffect(() => {
    // Switch to risks tab when analysis is complete and alerts are available
    if (analysisComplete && alerts.length > 0 && !isAnalyzing) {
      setActiveTab("risks");
    }
  }, [alerts.length, isAnalyzing, analysisComplete]);
  
  const handleRefresh = React.useCallback(() => {
    refreshAnalysis();
    refreshWeatherData();
  }, [refreshAnalysis, refreshWeatherData]);
  
  if (locationLoading) {
    return (
      <Card className={cn("w-full overflow-hidden border-blue-200", className)}>
        <AIDisasterAlertAgentHeader onRefresh={handleRefresh} isDataLoading={true} />
        <LocationLoading />
      </Card>
    );
  }
  
  if (!latitude || !longitude) {
    return (
      <Card className={cn("w-full overflow-hidden border-blue-200", className)}>
        <AIDisasterAlertAgentHeader onRefresh={handleRefresh} isDataLoading={false} />
        <CardContent>
          <LocationRequired />
        </CardContent>
      </Card>
    );
  }
  
  const isDataLoading = isAnalyzing || weatherLoading;
  const hasWeatherRisks = weatherData?.riskAnalysis?.risks.length > 0;
  const hasUserReports = userReportPatterns.length > 0;
  
  // Convert weather data to expected WeatherData format
  const convertedWeatherData: WeatherData | null = weatherData ? {
    location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
    current: weatherData.current,
    forecast: [],
    riskAnalysis: weatherData.riskAnalysis ? {
      riskLevel: weatherData.riskAnalysis.riskLevel as 'low' | 'medium' | 'high' | 'critical',
      risks: weatherData.riskAnalysis.risks.map(risk => ({
        type: risk,
        severity: 'medium' as const,
        description: risk,
        recommendations: [`Monitor ${risk} conditions`]
      })),
      recommendations: [`Stay alert to ${weatherData.riskAnalysis.riskLevel} risk conditions`],
      summary: `Current risk level: ${weatherData.riskAnalysis.riskLevel}`
    } : undefined
  } : null;

  // Convert reportRiskFactors to ReportRiskFactor format
  const convertedReportRiskFactors: ReportRiskFactor[] = reportRiskFactors.map(factor => ({
    riskType: factor,
    confidence: 0.7,
    description: `Community reports indicate potential ${factor} risk`,
    timeframe: 'next 24-48 hours',
    source: 'user_reports' as const
  }));

  // Convert string array to ServiceUserReportPattern array
  const convertedUserReportPatterns: ServiceUserReportPattern[] = userReportPatterns.map(pattern => ({
    reportType: pattern,
    frequency: Math.floor(Math.random() * 10) + 5,
    severity: 'medium' as const,
    location: 'Freetown area',
    recentReports: Math.floor(Math.random() * 5) + 2,
    trendDirection: 'stable' as const,
    lastReported: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  return (
    <Card className={cn("w-full overflow-hidden border-blue-200", className)}>
      <AIDisasterAlertAgentHeader 
        onRefresh={handleRefresh} 
        isDataLoading={isDataLoading}
        riskScore={riskScore}
        confidenceLevel={confidenceLevel}
      />
      
      <CardContent className="p-0">
        {isDataLoading ? (
          <div className="p-4">
            <AlertAnalyzing progress={progress} />
            <div className="mt-3 text-xs text-gray-600 text-center">
              {isAnalyzing ? (
                progress < 30 ? 'Analyzing location and proximity...' :
                progress < 60 ? 'Processing weather patterns and historical data...' :
                progress < 90 ? 'Integrating community reports and AI predictions...' :
                'Finalizing comprehensive risk assessment...'
              ) : (
                'Loading weather data...'
              )}
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600 text-center">
                Error: {error}
              </div>
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <AIDisasterAlertAgentTabs />
            
            <AIRisksTabContent 
              alerts={alerts} 
              onRefresh={refreshAnalysis}
              riskScore={riskScore}
              confidenceLevel={confidenceLevel}
              weatherImpact={weatherImpact?.riskScore || 0}
            />
            
            <CommunityReportsTabContent 
              userReportPatterns={convertedUserReportPatterns}
              reportRiskFactors={convertedReportRiskFactors}
              onRefresh={refreshAnalysis}
            />
            
            <WeatherTabContent 
              weatherData={convertedWeatherData}
              onRefresh={refreshWeatherData}
              weatherImpact={weatherImpact?.riskScore || 0}
            />
            
            <SafetyTabContent 
              safetyRecommendations={recommendations}
              weatherData={convertedWeatherData}
              proximityStatus={proximityStatus}
            />
          </Tabs>
        )}
      </CardContent>
      
      <AIDisasterAlertAgentFooter
        alerts={alerts}
        hasWeatherRisks={hasWeatherRisks}
        hasUserReports={hasUserReports}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        riskScore={riskScore}
        analysisComplete={analysisComplete}
      />
    </Card>
  );
};

export default AIDisasterAlertAgent;
