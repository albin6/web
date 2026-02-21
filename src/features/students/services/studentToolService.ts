import api from '@/services/api';
import type { ToolStudentListResponse, ToolStudentParams, Batch, Course, Domain, Employee, StatusOption } from '../types/toolTypes';

export const studentToolService = {
    getStudents: async (params: ToolStudentParams): Promise<ToolStudentListResponse> => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('offset', ((params.page - 1) * (params.pageSize || 10)).toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
        if (params.searchKey) queryParams.append('searchKey', params.searchKey);

        if (params.batchId) queryParams.append('batchIds', params.batchId);
        if (params.courseId) queryParams.append('courseIds', params.courseId);
        if (params.domainId) queryParams.append('domainIds', params.domainId);
        if (params.statusCodes) queryParams.append('statusCodes', params.statusCodes);

        const response = await api.get(`/api/tool/students?${queryParams.toString()}`);
        return response.data;
    },

    getBatches: async (): Promise<{ data: Batch[] }> => {
        const response = await api.get('/api/tool/batch');
        return response.data;
    },

    getCourses: async (): Promise<{ data: Course[] }> => {
        const response = await api.get('/api/tool/course');
        return response.data;
    },

    getDomains: async (): Promise<{ data: Domain[] }> => {
        const response = await api.get('/api/tool/domain');
        return response.data;
    },

    getEmployees: async (roles: string): Promise<{ data: Employee[] }> => {
        const response = await api.get(`/api/tool/employee/roles?roles=${roles}`);
        return response.data;
    },

    getStatusOptions: async (category: string): Promise<{ data: StatusOption[] }> => {
        const response = await api.get(`/api/tool/common/status?category=${category}`);
        return response.data;
    }
};
