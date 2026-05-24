/**
 * Logger Utility
 * Centralized logging for debugging and monitoring
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isDevelopment = __DEV__;

  private createEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: unknown): void {
    const entry = this.createEntry("debug", message, data);
    this.addLog(entry);
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.createEntry("info", message, data);
    this.addLog(entry);
    console.info(`[INFO] ${message}`, data);
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createEntry("warn", message, data);
    this.addLog(entry);
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, data?: unknown): void {
    const entry = this.createEntry("error", message, data);
    this.addLog(entry);
    console.error(`[ERROR] ${message}`, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
