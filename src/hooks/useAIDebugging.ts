
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorCollectionService } from '@/services/aiDebug/errorCollectionService';

export interface AIDebugInfo {
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
  suggestions: string[];
  healthStatus: 'good' | 'warning' | 'critical';
  errorCount: number;
}

export const useAIDebugging = (componentName?: string) => {
  const [debugInfo, setDebugInfo] = useState<AIDebugInfo>({
    isAnalyzing: false,
    lastAnalysis: null,
    suggestions: [],
    healthStatus: 'good',
    errorCount: 0
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Request AI analysis for current component/page
  const requestAnalysis = useCallback(async (issueDescription?: string) => {
    setDebugInfo(prev => ({ ...prev, isAnalyzing: true }));

    try {
      console.log('[AI Debugging] Requesting analysis for:', componentName);
      
      const { data, error } = await supabase.functions.invoke('ai-debug-agent', {
        body: {
          action: 'analyze_errors',
          data: {
            component: componentName,
            issueDescription,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      setAnalysisResults(data);
      setDebugInfo(prev => ({
        ...prev,
        isAnalyzing: false,
        lastAnalysis: new Date(),
        suggestions: data.analysis?.recommendations || [],
        errorCount: data.errorCount || 0,
        healthStatus: data.errorCount > 10 ? 'critical' : data.errorCount > 5 ? 'warning' : 'good'
      }));

      console.log('[AI Debugging] Analysis completed:', data);
    } catch (error) {
      console.error('[AI Debugging] Analysis failed:', error);
      setDebugInfo(prev => ({ ...prev, isAnalyzing: false }));
      
      errorCollectionService.logComponentError(componentName || 'ai-debugging', error as Error, { error });
    }
  }, [componentName]);

  // Request fix generation for a specific issue
  const requestFix = useCallback(async (issueData: any) => {
    try {
      console.log('[AI Debugging] Requesting fix for:', issueData);
      
      const { data, error } = await supabase.functions.invoke('ai-debug-agent', {
        body: {
          action: 'generate_fix',
          data: issueData
        }
      });

      if (error) {
        throw error;
      }

      console.log('[AI Debugging] Fix generated:', data);
      return data.fixSuggestion;
    } catch (error) {
      console.error('[AI Debugging] Fix generation failed:', error);
      errorCollectionService.logComponentError(componentName || 'ai-debugging', error as Error, { issueData, error });
      return null;
    }
  }, [componentName]);

  // Get health status
  const checkHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-debug-agent', {
        body: {
          action: 'health_check',
          data: { component: componentName }
        }
      });

      if (error) {
        throw error;
      }

      const failedChecks = data.healthMetrics?.checks?.filter((check: any) => check.status === 'failed') || [];
      const newHealthStatus = failedChecks.length > 2 ? 'critical' : failedChecks.length > 0 ? 'warning' : 'good';

      setDebugInfo(prev => ({
        ...prev,
        healthStatus: newHealthStatus,
        suggestions: data.aiAnalysis?.recommendations || prev.suggestions
      }));

      return data;
    } catch (error) {
      console.error('[AI Debugging] Health check failed:', error);
      return null;
    }
  }, [componentName]);

  // Log component-specific errors
  const logError = useCallback((error: Error, metadata?: any) => {
    errorCollectionService.logComponentError(componentName || 'unknown', error, metadata);
  }, [componentName]);

  const logWarning = useCallback((message: string, metadata?: any) => {
    errorCollectionService.logComponentWarning(componentName || 'unknown', message, metadata);
  }, [componentName]);

  const logInfo = useCallback((message: string, metadata?: any) => {
    errorCollectionService.logComponentInfo(componentName || 'unknown', message, metadata);
  }, [componentName]);

  // Fetch recent analysis results on mount
  useEffect(() => {
    const fetchRecentAnalysis = async () => {
      try {
        // Use a simple query that won't fail if tables don't exist
        console.log('[AI Debugging] Attempting to fetch recent analysis...');
        
        // For now, just set empty state since the tables were just created
        setDebugInfo(prev => ({
          ...prev,
          lastAnalysis: null,
          suggestions: []
        }));
      } catch (error) {
        console.log('[AI Debugging] No recent analysis found:', error);
      }
    };

    fetchRecentAnalysis();
  }, []);

  return {
    debugInfo,
    analysisResults,
    requestAnalysis,
    requestFix,
    checkHealth,
    logError,
    logWarning,
    logInfo
  };
};
