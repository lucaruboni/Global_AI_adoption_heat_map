import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Validates and exposes environment configuration as a typed, frozen object.
 * Fails fast at startup if required variables are missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(1521),
  DATABASE_USER: z.string().default('aiheatmap'),
  DATABASE_PASSWORD: z.string().default('aiheatmap_dev_123'),
  DATABASE_NAME: z.string().default('XEPDB1'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  JWT_SECRET: z.string().min(8).default('dev_secret_key_change_in_prod'),
  JWT_EXPIRE_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  ALPHA_VANTAGE_API_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = Object.freeze({
  env: parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  port: parsed.data.PORT,
  logLevel: parsed.data.LOG_LEVEL,
  database: {
    host: parsed.data.DATABASE_HOST,
    port: parsed.data.DATABASE_PORT,
    user: parsed.data.DATABASE_USER,
    password: parsed.data.DATABASE_PASSWORD,
    serviceName: parsed.data.DATABASE_NAME,
  },
  redis: {
    host: parsed.data.REDIS_HOST,
    port: parsed.data.REDIS_PORT,
  },
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRE_IN,
  },
  corsOrigin: parsed.data.CORS_ORIGIN,
  alphaVantageApiKey: parsed.data.ALPHA_VANTAGE_API_KEY ?? null,
  smtp: {
    host: parsed.data.SMTP_HOST ?? null,
    port: parsed.data.SMTP_PORT ?? 587,
    user: parsed.data.SMTP_USER ?? null,
    password: parsed.data.SMTP_PASSWORD ?? null,
    from: parsed.data.SMTP_FROM ?? 'noreply@aiheatmap.local',
  },
});
