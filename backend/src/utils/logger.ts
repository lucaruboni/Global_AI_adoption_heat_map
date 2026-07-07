import winston from 'winston';

const logLevel = process.env.LOG_LEVEL ?? 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'ai-heatmap-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { level, message, timestamp, ...meta } = info;
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${String(timestamp)} [${level}] ${String(message)} ${metaStr}`;
        }),
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
