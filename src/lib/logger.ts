type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  user?: string;
  additionalInfo?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In a production environment, you could send logs to a service
    if (!this.isDevelopment && level === 'error') {
      // TODO: Implement production error logging service
      // e.g., send to error tracking service
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorMessage = error
      ? `${message}\nError: ${error.message}\nStack: ${error.stack}`
      : message;
    this.log('error', errorMessage, context);
  }
}

export const logger = new Logger();
