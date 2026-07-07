import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { loginSchema, registerSchema } from '../validation/authSchemas';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);
    res.status(201).json({ data: result });
  }

  async login(req: Request, res: Response): Promise<void> {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);
    res.status(200).json({ data: result });
  }
}

export const authController = new AuthController();
