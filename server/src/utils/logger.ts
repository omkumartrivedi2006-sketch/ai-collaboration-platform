export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  public info(message: string, meta?: any): void {
    console.log(Logger.formatMessage('info', message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(Logger.formatMessage('warning', message, meta));
  }

  public error(message: string, error?: any, meta?: any): void {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(Logger.formatMessage('error', message, { ...meta, error: errorDetails }));
  }

  public debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(Logger.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;
