import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { AppDataSource } from './database/data-source';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRouter } from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Rate limiting
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND', status: 404 } });
});

// Error handling
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Database connected');
  } catch (err) {
    logger.error('❌ Database connection failed — starting API without DB', err);
    // In development we still boot so /health and non-DB routes work.
    if (config.isProduction) process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} (${config.env})`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received: shutting down`);
    server.close(() => {
      void AppDataSource.destroy().finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
}

void bootstrap();

export default app;
