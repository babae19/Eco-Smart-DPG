
import { useState, useEffect, useCallback } from 'react';
import { Alert } from '@/types/AlertTypes';
import { generatePersonalizedAlerts } from '@/services/predictiveAlertService';
import { generateSafetyRecommendations } from '@/services/disaster/notificationUtils';

interface UseAlertAnalysisProps {
  latitude?: number;
  longitude?: number;
}

export function useAlertAnalysis({ latitude, longitude }: UseAlertAnalysisProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [safetyRecommendations, setSafetyRecommendations] = useState<string[]>([]);

  const generateAlertsWithAnimation = useCallback(async () => {
    if (!latitude || !longitude) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Animate the progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);
    
    try {
      // Generate personalized alerts
      const newAlerts = generatePersonalizedAlerts(latitude, longitude);
      
      // Add a small delay to show the analysis in progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process alerts and extract safety recommendations
      if (newAlerts.length > 0) {
        setAlerts(newAlerts);
        
        // Get safety recommendations for the highest-risk alert
        const highestRiskAlert = newAlerts.reduce(
          (highest, current) => 
            (current.aiPredictionScore || 0) > (highest.aiPredictionScore || 0) 
              ? current 
              : highest, 
          { aiPredictionScore: 0 } as Alert
        );
        
        const recommendations = generateSafetyRecommendations(
          highestRiskAlert,
          { latitude, longitude }
        );
        
        setSafetyRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Error generating AI alerts:', error);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  }, [latitude, longitude]);

  // Generate personalized alerts based on user's location
  useEffect(() => {
    if (latitude && longitude) {
      generateAlertsWithAnimation();
    }
  }, [latitude, longitude, generateAlertsWithAnimation]);

  return {
    alerts,
    isAnalyzing,
    progress,
    safetyRecommendations,
    refreshAnalysis: generateAlertsWithAnimation
  };
}
