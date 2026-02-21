import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { wsClient, type WebSocketMessage } from '@/lib/websocket-client';
import type { AppRole } from '@/types/database';

interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_approved: boolean;
    email_verified: boolean;
    role: AppRole;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, fullName: string, requestedRole: string, requestedTeamID?: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isApproved: boolean | null;
    role: AppRole | null;
    isTeamLeader: boolean;
    canAccessTeams: boolean;
    canManageTasks: boolean;
    canViewAnalytics: boolean;
    canManageMembers: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTeamLeader, setIsTeamLeader] = useState(false);
    const [canAccessTeams, setCanAccessTeams] = useState(false);
    const [canManageTasks, setCanManageTasks] = useState(false);
    const [canViewAnalytics, setCanViewAnalytics] = useState(false);
    const [canManageMembers, setCanManageMembers] = useState(false);

    const fetchUser = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setUser(null);
                setLoading(false);
                return;
            }

            const userData = await apiClient.getMe();

            if (!userData || !userData.profile) {
                console.error('Invalid user data structure:', userData);
                throw new Error('Invalid user data received from API');
            }

            setUser({
                id: userData.profile.id,
                email: userData.profile.email,
                full_name: userData.profile.full_name,
                avatar_url: userData.profile.avatar_url,
                is_approved: userData.profile.is_approved,
                email_verified: userData.profile.email_verified,
                role: userData.role || 'user',
            });

            wsClient.connect(accessToken);

            try {
                const teams = await apiClient.getUserTeams();

                const leadership = teams.some((t: any) => t.is_head || t.is_lead);
                const access = teams.some((t: any) =>
                    t.is_head ||
                    t.is_lead ||
                    t.can_manage_tasks ||
                    t.can_view_analytics ||
                    t.can_manage_members_limited
                );

                const manageTasks = teams.some((t: any) => t.can_manage_tasks);
                const viewAnalytics = teams.some((t: any) => t.can_view_analytics);
                const manageMembers = teams.some((t: any) => t.can_manage_members_limited);

                setIsTeamLeader(leadership);
                setCanAccessTeams(access);
                setCanManageTasks(manageTasks);
                setCanViewAnalytics(viewAnalytics);
                setCanManageMembers(manageMembers);
            } catch (err) {
                console.error('Error checking team leadership:', err);
                setIsTeamLeader(false);
                setCanAccessTeams(false);
                setCanManageTasks(false);
                setCanViewAnalytics(false);
                setCanManageMembers(false);
            }

        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsTeamLeader(false);
            setCanAccessTeams(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        const unsubscribe = wsClient.onMessage((message: WebSocketMessage) => {
            if (message.type === 'user_approved') {
                fetchUser();
            }
        });

        return () => {
            unsubscribe();
            wsClient.disconnect();
        };
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);

            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);

            await fetchUser();
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const signUpWithEmail = async (email: string, password: string, fullName: string, requestedRole: string, requestedTeamID?: string) => {
        try {
            await apiClient.signup(email, password, fullName, requestedRole, requestedTeamID);
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error.response?.data?.error || 'Signup failed');
        }
    };

    const signOut = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await apiClient.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsTeamLeader(false);
            setCanAccessTeams(false);
            wsClient.disconnect();
        }
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const isAdmin = user?.role === 'admin';
    const isApproved = user?.is_approved ?? null;
    const role = user?.role ?? null;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                isAdmin,
                isTeamLeader,
                canAccessTeams,
                canManageTasks,
                canViewAnalytics,
                canManageMembers,
                isApproved,
                role,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
