
import { supabase } from '@/integrations/supabase/client';

class AIDebuggingInitializer {
  private isInitialized = false;
  private healthCheckAttempts = 0;
  private maxHealthCheckAttempts = 3;

  async initialize() {
    if (this.isInitialized) {
      console.log('[ai-debugging-init] Already initialized, skipping');
      return;
    }

    try {
      console.log('[ai-debugging-init] Starting AI Debugging initialization');
      
      // Only attempt health check if we haven't exceeded max attempts
      if (this.healthCheckAttempts < this.maxHealthCheckAttempts) {
        await this.performInitialHealthCheck();
      } else {
        console.warn('[ai-debugging-init] Skipping health check due to repeated failures');
      }
      
      this.isInitialized = true;
      console.log('[ai-debugging-init] AI Debugging system initialized');
    } catch (error) {
      this.healthCheckAttempts++;
      console.error('[ai-debugging-init] Initialization failed:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        attempts: this.healthCheckAttempts
      });
      
      // Don't throw the error to prevent blocking the app
      if (this.healthCheckAttempts >= this.maxHealthCheckAttempts) {
        console.warn('[ai-debugging-init] Max health check attempts reached, disabling AI debugging');
      }
    }
  }

  private async performInitialHealthCheck() {
    console.log('[AI Debugging] Performing initial health check...');
    this.healthCheckAttempts++;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-debug-agent', {
        body: { 
          action: 'health_check',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      console.log('[AI Debugging] Health check passed:', data);
    } catch (error) {
      console.error('[AI Debugging] Initial health check failed:', {
        _type: 'Error',
        value: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          context: {}
        } : error
      });
      throw error;
    }
  }
}

export const aiDebuggingInitializer = new AIDebuggingInitializer();
