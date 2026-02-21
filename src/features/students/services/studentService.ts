import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { Student, StudentsResponse } from '@/types/api';

export interface GetStudentsParams {
    search?: string;
    program_status?: boolean;
    sort_by?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface CreateStudentRequest {
    full_name: string;
    email: string;
    phone: string;
    program_status?: boolean;
}

export const studentService = {
    getStudents: async (params: GetStudentsParams): Promise<StudentsResponse> => {
        const response = await api.get(ENDPOINTS.STUDENTS.LIST, { params });
        return response.data;
    },

    createStudent: async (data: CreateStudentRequest): Promise<Student> => {
        const response = await api.post(ENDPOINTS.STUDENTS.CREATE, data);
        return response.data;
    },

    search: async (query: string, limit: number = 10): Promise<Student[]> => {
        if (!query.trim()) {
            return [];
        }
        const response = await api.get<{ data: any[] }>(
            ENDPOINTS.STUDENTS.SEARCH,
            { params: { searchKey: query, pageSize: limit, statusCodes: '2' } }
        );

        // Map ToolStudent to Student interface
        return response.data.data.map((s: any) => ({
            id: s.id, // now a string (UUID)
            full_name: s.name,
            phone: s.mobile,
            email: s.email,
            program_status: s.status === 'Ongoing',
            created_at: s.createdOn,
            updated_at: s.createdOn, // Tool API might not have separate updated_at in summary
        })) as unknown as Student[];
    },
};
