import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@shared/index';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/User';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { mapPublicUser } from './mappers';

const SALT_ROUNDS = 10;

interface JwtClaims {
  sub: number;
  email: string;
}

export class AuthService {
  private get users(): ReturnType<typeof AppDataSource.getRepository<User>> {
    return AppDataSource.getRepository(User);
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const email = payload.email.toLowerCase().trim();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ApiError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const user = this.users.create({
      email,
      passwordHash,
      githubUsername: payload.githubUsername ?? null,
      linkedinUrl: payload.linkedinUrl ?? null,
      optedInNewsletter: payload.optedInNewsletter ? 1 : 0,
    });
    const saved = await this.users.save(user);

    return { user: mapPublicUser(saved), token: this.signToken(saved) };
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const email = payload.email.toLowerCase().trim();
    const user = await this.users.findOne({ where: { email } });
    if (!user) {
      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    return { user: mapPublicUser(user), token: this.signToken(user) };
  }

  /** Verifies a bearer token and returns its claims, or throws 401. */
  verifyToken(token: string): JwtClaims {
    try {
      return jwt.verify(token, config.jwt.secret) as unknown as JwtClaims;
    } catch {
      throw new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  }

  private signToken(user: User): string {
    const claims: JwtClaims = { sub: user.id, email: user.email };
    return jwt.sign(claims, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();
