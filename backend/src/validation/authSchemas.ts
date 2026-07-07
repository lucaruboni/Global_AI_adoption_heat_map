import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  githubUsername: z.string().max(255).optional(),
  linkedinUrl: z.string().url('LinkedIn URL must be a valid URL').max(500).optional(),
  optedInNewsletter: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
