import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { User, UsersSearchResponse } from '@/types/api';

export const userService = {
    search: async (query: string, limit: number = 10): Promise<User[]> => {
        if (!query.trim()) {
            return [];
        }
        const response = await api.get<UsersSearchResponse>(ENDPOINTS.USER.SEARCH, {
            params: { q: query, limit },
        });
        return response.data.users;
    },
};
