
interface DebugLog {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component: string;
  metadata?: any;
  session_id: string;
  created_at: string;
}

class ErrorCollectionService {
  private logs: DebugLog[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private sessionId: string;
  private isProcessing = false;
  private maxRetries = 3;
  private retryCount = 0;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[Error Collection] Service initialized with session:', this.sessionId);
  }

  addLog(log: Omit<DebugLog, 'session_id' | 'created_at'>) {
    // Prevent infinite loops by not logging our own errors
    if (log.component === 'error-collection-service') {
      return;
    }

    const debugLog: DebugLog = {
      ...log,
      session_id: this.sessionId,
      created_at: new Date().toISOString()
    };

    this.logs.push(debugLog);

    // Batch logs to prevent spam
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, 5000); // Wait 5 seconds before sending batch
  }

  // Add the missing methods that other files are trying to use
  logInfo(message: string, component: string, metadata?: any) {
    this.addLog({
      level: 'info',
      message,
      component,
      metadata
    });
  }

  logError(log: Omit<DebugLog, 'session_id' | 'created_at'>) {
    this.addLog(log);
  }

  logComponentError(component: string, error: Error, metadata?: any) {
    this.addLog({
      level: 'error',
      message: `Component error: ${error.message}`,
      component,
      metadata: { ...metadata, error: error.stack }
    });
  }

  logComponentWarning(component: string, message: string, metadata?: any) {
    this.addLog({
      level: 'warn',
      message,
      component,
      metadata
    });
  }

  logComponentInfo(component: string, message: string, metadata?: any) {
    this.addLog({
      level: 'info',
      message,
      component,
      metadata
    });
  }

  private async processBatch() {
    if (this.isProcessing || this.logs.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToSend = [...this.logs];
    this.logs = []; // Clear logs immediately to prevent duplicates

    try {
      console.log(`[Error Collection] Processing batch of ${logsToSend.length} logs`);
      
      // For now, just log locally instead of sending to edge function
      // This prevents the infinite error loop
      this.logBatchLocally(logsToSend);
      
      this.retryCount = 0; // Reset retry count on success
    } catch (error) {
      console.error('[Error Collection] Failed to send batch:', {
        _type: 'Error',
        value: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          context: {}
        }
      });

      this.retryCount++;
      
      // Don't retry indefinitely
      if (this.retryCount < this.maxRetries) {
        // Put logs back for retry
        this.logs.unshift(...logsToSend);
        
        // Exponential backoff
        setTimeout(() => {
          this.isProcessing = false;
          this.processBatch();
        }, Math.pow(2, this.retryCount) * 1000);
      } else {
        console.warn('[Error Collection] Max retries exceeded, dropping batch');
        this.retryCount = 0;
      }
    } finally {
      if (this.retryCount === 0) {
        this.isProcessing = false;
      }
    }
  }

  private logBatchLocally(logs: DebugLog[]) {
    // Group logs by level for better visibility
    const grouped = logs.reduce((acc, log) => {
      if (!acc[log.level]) acc[log.level] = [];
      acc[log.level].push(log);
      return acc;
    }, {} as Record<string, DebugLog[]>);

    console.group(`[AI Debug Local] Batch Report (${logs.length} logs)`);
    
    Object.entries(grouped).forEach(([level, levelLogs]) => {
      console.group(`${level.toUpperCase()} (${levelLogs.length})`);
      levelLogs.forEach(log => {
        console.log(`[${log.component}] ${log.message}`, log.metadata || '');
      });
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  // Health check method that doesn't cause errors
  async healthCheck(): Promise<boolean> {
    try {
      // Simple connectivity check without causing errors
      return navigator.onLine;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const errorCollectionService = new ErrorCollectionService();

// Initialize without causing errors
errorCollectionService.addLog({
  level: 'info',
  message: 'AI Debugging system initialized',
  component: 'ai-debugging-init'
});

// Export both the class and the singleton instance
export { ErrorCollectionService, errorCollectionService };
