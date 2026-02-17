export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'ADMIN' | 'HEAD' | 'LEAD' | 'MEMBER';
}

export interface StudentsSearchResponse {
    students: Student[];
}

export interface UsersSearchResponse {
    users: User[];
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'HEAD' | 'LEAD' | 'MEMBER';
}

export interface Student {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    program_status: boolean;
    created_at: string;
    updated_at: string;
}

export interface StudentsResponse {
    data: Student[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
