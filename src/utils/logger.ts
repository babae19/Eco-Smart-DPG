export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatMessage(level: LogLevel, message: string, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentStr = component ? `[${component}]` : '';
    return `${timestamp} ${level.toUpperCase()}: ${componentStr} ${message}`;
  }

  private addLog(level: LogLevel, message: string, component?: string, metadata?: Record<string, unknown>) {
    const logEntry: LogEntry = {
      level,
      message,
      component,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.logs.push(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  info(message: string, component?: string, metadata?: Record<string, unknown>) {
    this.addLog('info', message, component, metadata);
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, component), metadata || '');
    }
  }

  warn(message: string, component?: string, metadata?: Record<string, unknown>) {
    this.addLog('warn', message, component, metadata);
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, component), metadata || '');
    }
  }

  error(message: string, component?: string, metadata?: Record<string, unknown>) {
    this.addLog('error', message, component, metadata);
    console.error(this.formatMessage('error', message, component), metadata || '');
  }

  debug(message: string, component?: string, metadata?: Record<string, unknown>) {
    this.addLog('debug', message, component, metadata);
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, component), metadata || '');
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
