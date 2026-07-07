import type { ApiSuccess, AuthResponse, LoginPayload, RegisterPayload } from '@shared/index';
import { apiClient, tokenStore } from './apiClient';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload);
    tokenStore.set(data.data.token);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload);
    tokenStore.set(data.data.token);
    return data.data;
  },

  logout(): void {
    tokenStore.clear();
  },

  isAuthenticated(): boolean {
    return tokenStore.get() !== null;
  },
};
