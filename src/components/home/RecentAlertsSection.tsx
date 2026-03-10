
import React from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import AlertsHeader from './alerts/AlertsHeader';
import AlertStatusNotifications from './alerts/AlertStatusNotifications';
import AlertsListContent from './alerts/AlertsListContent';
import { useEnhancedAlertsIntegration } from './alerts/useEnhancedAlertsIntegration';
import { Alert } from '@/types/AlertTypes';

// Helper function to convert hook alerts to AlertTypes format
const convertToAlertType = (alert: any): Alert => ({
  ...alert,
  severity: alert.severity as 'high' | 'medium' | 'low',
  date: alert.date || alert.created_at,
  isNew: false,
  type: alert.type || 'general'
});

const RecentAlertsSection: React.FC = () => {
  const { alerts: databaseAlerts, loading, lastUpdated, setAlerts, error, refetch } = useAlerts();
  
  // Convert database alerts to the expected AlertTypes format
  const convertedAlerts = databaseAlerts.map(convertToAlertType);
  
  const {
    enhancementAttempted,
    enhancementError,
    enhancedAlerts,
    isAnalyzing,
    analysisComplete,
    userReportPatterns
  } = useEnhancedAlertsIntegration({
    databaseAlerts: convertedAlerts,
    setAlerts: (alerts: Alert[]) => {
      // Convert back to the hook's expected format if needed
      setAlerts(alerts as any);
    },
    loading
  });
  
  // Use enhanced alerts if available and successful, otherwise fall back to converted alerts
  const displayAlerts = enhancementAttempted && enhancedAlerts.length > 0 ? 
    enhancedAlerts.slice(0, 5) : convertedAlerts.slice(0, 5);
  
  return (
    <section className="mb-6">
      <AlertsHeader lastUpdated={lastUpdated?.toLocaleTimeString() || null} />
      
      <AlertStatusNotifications
        error={error}
        isAnalyzing={isAnalyzing}
        enhancementError={enhancementError}
        analysisComplete={analysisComplete}
        enhancedAlertsCount={enhancedAlerts.length}
        userReportPatternsCount={userReportPatterns.length}
      />
      
      <AlertsListContent
        displayAlerts={displayAlerts}
        loading={loading}
        isAnalyzing={isAnalyzing}
      />
    </section>
  );
};

export default RecentAlertsSection;
