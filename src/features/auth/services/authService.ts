import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { LoginRequest, SignupRequest, AuthResponse } from '@/types/api';

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post(ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    signup: async (data: SignupRequest): Promise<void> => {
        await api.post(ENDPOINTS.AUTH.SIGNUP, data);
    },

    logout: async (refreshToken: string): Promise<void> => {
        await api.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
        return response.data;
    },
};
