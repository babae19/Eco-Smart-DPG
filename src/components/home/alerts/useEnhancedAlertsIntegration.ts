
import { useState, useEffect } from 'react';
import { Alert } from '@/types/AlertTypes';
import { useUserLocation } from '@/contexts/LocationContext';
import { useEnhancedAlertAnalysis } from '@/components/disaster-alerts/hooks/useEnhancedAlertAnalysis';

interface UseEnhancedAlertsIntegrationProps {
  databaseAlerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  loading: boolean;
}

export const useEnhancedAlertsIntegration = ({
  databaseAlerts,
  setAlerts,
  loading
}: UseEnhancedAlertsIntegrationProps) => {
  const { latitude, longitude } = useUserLocation();
  const [enhancementAttempted, setEnhancementAttempted] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);
  
  const { 
    alerts: enhancedAlerts, 
    isAnalyzing,
    analysisComplete,
    userReportPatterns,
    reportRiskFactors
  } = useEnhancedAlertAnalysis({ latitude, longitude });
  
  // Combine database alerts with enhanced AI analysis
  useEffect(() => {
    if (latitude && longitude && !loading && !enhancementAttempted && analysisComplete) {
      try {
        console.log('[Enhanced Alerts Integration] Integrating enhanced alerts with database alerts');
        
        if (enhancedAlerts.length > 0) {
          // Mark enhanced alerts as personalized and prioritize them
          const enhancedPersonalizedAlerts = enhancedAlerts.map(alert => ({
            ...alert,
            isPersonalized: true,
            isNew: true
          }));
          
          // Combine with existing database alerts, prioritizing enhanced ones
          const combinedAlerts = [...enhancedPersonalizedAlerts, ...databaseAlerts];
          
          // Limit to 10 alerts total with priority to high-risk personalized ones
          const prioritizedAlerts = combinedAlerts
            .sort((a, b) => {
              // Prioritize personalized alerts
              if (a.isPersonalized && !b.isPersonalized) return -1;
              if (!a.isPersonalized && b.isPersonalized) return 1;
              
              // Then by severity
              const severityOrder = { high: 3, medium: 2, low: 1 };
              const aSeverity = severityOrder[a.severity] || 0;
              const bSeverity = severityOrder[b.severity] || 0;
              if (aSeverity !== bSeverity) return bSeverity - aSeverity;
              
              // Finally by AI prediction score
              return (b.aiPredictionScore || 0) - (a.aiPredictionScore || 0);
            })
            .slice(0, 10);
          
          setAlerts(prioritizedAlerts);
          console.log(`[Enhanced Alerts Integration] Set ${prioritizedAlerts.length} combined alerts`);
        }
        
        setEnhancementError(null);
      } catch (err) {
        console.error('[Enhanced Alerts Integration] Error integrating enhanced alerts:', err);
        setEnhancementError(err instanceof Error ? err.message : 'Failed to integrate enhanced alert analysis');
      } finally {
        setEnhancementAttempted(true);
      }
    }
  }, [latitude, longitude, loading, databaseAlerts, setAlerts, enhancementAttempted, enhancedAlerts, analysisComplete]);
  
  // Reset enhancement attempt when location changes significantly
  useEffect(() => {
    if (latitude && longitude) {
      setEnhancementAttempted(false);
      setEnhancementError(null);
    }
  }, [Math.round((latitude || 0) * 1000), Math.round((longitude || 0) * 1000)]);

  return {
    enhancementAttempted,
    enhancementError,
    enhancedAlerts,
    isAnalyzing,
    analysisComplete,
    userReportPatterns
  };
};
