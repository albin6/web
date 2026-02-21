import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Pointing to the Gateway
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refresh_token');
                        if (refreshToken) {
                            const response = await axios.post(`${API_URL}/auth/refresh`, {
                                refresh_token: refreshToken,
                            });

                            const { access_token } = response.data;
                            localStorage.setItem('access_token', access_token);

                            originalRequest.headers.Authorization = `Bearer ${access_token}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async signup(email: string, password: string, fullName: string, requestedRole: string, requestedTeamID?: string) {
        const response = await this.client.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            requested_role: requestedRole,
            requested_team_id: requestedTeamID,
        });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    }

    async logout(refreshToken: string) {
        const response = await this.client.post('/auth/logout', {
            refresh_token: refreshToken,
        });
        return response.data;
    }

    async getMe() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    async forgotPassword(email: string, newPassword?: string) {
        const response = await this.client.post('/auth/forgot-password', {
            email,
            new_password: newPassword,
        });
        return response.data;
    }

    async resetPassword(token: string, newPassword: string) {
        const response = await this.client.post('/auth/reset-password', {
            token,
            new_password: newPassword,
        });
        return response.data;
    }

    async changePassword(oldPassword: string, newPassword: string) {
        const response = await this.client.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
        });
        return response.data;
    }

    // User endpoints
    async getUsers(params?: {
        search?: string;
        role?: string;
        status?: string;
        sort_by?: string;
        sort_dir?: string;
        limit?: number;
        offset?: number;
    }) {
        const response = await this.client.get('/users', { params });
        return response.data;
    }

    async adminCreateUser(data: {
        name: string;
        email: string;
        role?: string;
        team_id?: string;
        role_id?: string;
        password?: string;
    }) {
        const response = await this.client.post('/admin/users', data);
        return response.data;
    }

    async getAdminStats() {
        const response = await this.client.get('/admin/stats');
        return response.data as {
            total_users: number;
            pending_approvals: number;
            total_teams: number;
            total_tasks: number;
        };
    }

    async getUser(id: string) {
        const response = await this.client.get(`/users/${id}`);
        return response.data;
    }

    async updateProfile(id: string, data: { full_name?: string; avatar_url?: string }) {
        const response = await this.client.put(`/users/${id}`, data);
        return response.data;
    }

    async deleteUser(id: string) {
        const response = await this.client.delete(`/users/${id}`);
        return response.data;
    }

    async approveUser(id: string) {
        const response = await this.client.post(`/users/${id}/approve`);
        return response.data;
    }

    async demoteUser(id: string) {
        const response = await this.client.post(`/users/${id}/demote`);
        return response.data;
    }

    async promoteUser(id: string) {
        const response = await this.client.post(`/users/${id}/promote`);
        return response.data;
    }

    // Task endpoints
    async getTasks(params?: {
        status?: string;
        assigned_user_id?: string;
        created_by?: string;
        team_id?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        const response = await this.client.get('/tasks', { params });
        if (!response.data) return [];
        return Array.isArray(response.data) ? response.data : (response.data.tasks || []);
    }

    async getTask(id: string) {
        const response = await this.client.get(`/tasks/${id}`);
        return response.data;
    }

    async createTask(data: {
        task_name: string;
        assigned_user_id: string;
        deadline: string;
        team_id?: string;
    }) {
        const response = await this.client.post('/tasks', data);
        return response.data;
    }

    async updateTask(id: string, data: any) {
        const response = await this.client.put(`/tasks/${id}`, data);
        return response.data;
    }

    async updateTaskStatus(id: string, status: string) {
        const response = await this.client.patch(`/tasks/${id}/status`, { status });
        return response.data;
    }

    async deleteTask(id: string) {
        const response = await this.client.delete(`/tasks/${id}`);
        return response.data;
    }

    // Deadline request endpoints
    async getDeadlineRequests(params?: { status?: string; requested_by?: string }) {
        const response = await this.client.get('/deadline-requests', { params });
        if (!response.data) return [];
        return Array.isArray(response.data) ? response.data : (response.data.requests || []);
    }

    async getDeadlineRequest(id: string) {
        const response = await this.client.get(`/deadline-requests/${id}`);
        return response.data;
    }

    async createDeadlineRequest(data: {
        task_id: string;
        requested_deadline: string;
        reason: string;
    }) {
        const response = await this.client.post('/deadline-requests', data);
        return response.data;
    }

    async approveDeadlineRequest(id: string) {
        const response = await this.client.post(`/deadline-requests/${id}/approve`);
        return response.data;
    }

    async rejectDeadlineRequest(id: string) {
        const response = await this.client.post(`/deadline-requests/${id}/reject`);
        return response.data;
    }

    // Team endpoints
    async getTeams() {
        const response = await this.client.get('/teams');
        return Array.isArray(response.data) ? response.data : [];
    }

    async getPublicTeams() {
        try {
            const response = await axios.get(`${API_URL}/auth/teams`);
            if (Array.isArray(response.data)) return response.data;
        } catch (e) {
            console.warn('Failed to fetch from /auth/teams, trying /public/teams');
        }

        try {
            const response = await axios.get(`${API_URL.replace('/api', '')}/api/public/teams`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Failed to fetch public teams from all endpoints:', error);
            return [];
        }
    }

    async getTeam(id: string) {
        const response = await this.client.get(`/teams/${id}`);
        return response.data;
    }

    async getUserTeams() {
        const response = await this.client.get(`/teams/my-teams`);
        return Array.isArray(response.data) ? response.data : [];
    }

    async createTeam(data: {
        name: string;
        description?: string;
        head_user_id?: string;
    }) {
        const response = await this.client.post('/teams', data);
        return response.data;
    }

    async updateTeam(id: string, data: {
        name?: string;
        description?: string;
    }) {
        const response = await this.client.put(`/teams/${id}`, data);
        return response.data;
    }

    async deleteTeam(id: string) {
        const response = await this.client.delete(`/teams/${id}`);
        return response.data;
    }

    async addTeamMember(teamId: string, data: {
        user_id: string;
        role_id?: string;
        is_head?: boolean;
        is_lead?: boolean;
    }) {
        const response = await this.client.post(`/teams/${teamId}/members`, data);
        return response.data;
    }

    async removeTeamMember(teamId: string, userId: string) {
        const response = await this.client.delete(`/teams/${teamId}/members/${userId}`);
        return response.data;
    }

    async updateTeamMemberRole(teamId: string, userId: string, data: {
        role_id?: string;
        is_head?: boolean;
        is_lead?: boolean;
    }) {
        const response = await this.client.put(`/teams/${teamId}/members/${userId}/role`, data);
        return response.data;
    }

    async getTeamRoles(teamId: string) {
        const response = await this.client.get(`/teams/${teamId}/roles`);
        return Array.isArray(response.data) ? response.data : [];
    }

    async createTeamRole(teamId: string, data: {
        role_name: string;
        permissions?: string[];
    }) {
        const response = await this.client.post(`/teams/${teamId}/roles`, data);
        return response.data;
    }

    async getAssignableUsers(teamId: string) {
        const response = await this.client.get(`/teams/${teamId}/assignable-users`);
        return Array.isArray(response.data) ? response.data : [];
    }

    async getCustomRoles(teamId: string) {
        const response = await this.client.get(`/teams/${teamId}/custom-roles`);
        return Array.isArray(response.data) ? response.data : [];
    }

    async createCustomRole(teamId: string, data: {
        role_name: string;
        can_manage_tasks: boolean;
        can_view_analytics: boolean;
        can_manage_members_limited: boolean;
    }) {
        const response = await this.client.post(`/teams/${teamId}/custom-roles`, data);
        return response.data;
    }

    async updateCustomRole(teamId: string, roleId: string, data: {
        role_name?: string;
        can_manage_tasks?: boolean;
        can_view_analytics?: boolean;
        can_manage_members_limited?: boolean;
    }) {
        const response = await this.client.put(`/teams/${teamId}/custom-roles/${roleId}`, data);
        return response.data;
    }

    async deleteCustomRole(teamId: string, roleId: string) {
        const response = await this.client.delete(`/teams/${teamId}/custom-roles/${roleId}`);
        return response.data;
    }

    async assignCustomRole(teamId: string, memberId: string, customRoleId: string | null) {
        const response = await this.client.post(`/teams/${teamId}/members/${memberId}/custom-role`, {
            custom_role_id: customRoleId
        });
        return response.data;
    }

    async updateMemberPosition(teamId: string, memberId: string, position: string) {
        const response = await this.client.put(`/teams/${teamId}/members/${memberId}/position`, {
            position
        });
        return response.data;
    }
}

export const apiClient = new APIClient();
export default apiClient;
