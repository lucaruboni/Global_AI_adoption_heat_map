type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;

const colors: Record<LogLevel, string> = {
  debug: '#888',
  info: '#2563eb',
  warn: '#f59e0b',
  error: '#ef4444',
};

const log = (level: LogLevel, message: string, data?: unknown): void => {
  const timestamp = new Date().toISOString();
  const style = `color: ${colors[level]}; font-weight: bold;`;

  if (isDevelopment) {
    console.log(`%c[${timestamp}] [${level.toUpperCase()}]`, style, message, data);
  }
};

export const logger = {
  debug: (message: string, data?: unknown): void => log('debug', message, data),
  info: (message: string, data?: unknown): void => log('info', message, data),
  warn: (message: string, data?: unknown): void => log('warn', message, data),
  error: (message: string, err?: unknown): void => log('error', message, err),
};
