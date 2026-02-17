import { useState, useEffect, useCallback } from 'react';
import type { GetStudentsParams, CreateStudentRequest } from '../services/studentService';
import { studentService } from '../services/studentService';
import type { Student } from '@/types/api';
import { toast } from "sonner";

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [params, setParams] = useState<GetStudentsParams>({
        page: 1,
        limit: 10,
        search: '',
        sort_by: 'created_at',
        order: 'desc',
    });

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await studentService.getStudents(params);
            setStudents(response.data);
            setTotal(response.pagination.total);
            setTotalPages(response.pagination.total_pages);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error fetching students");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const createStudent = async (data: CreateStudentRequest) => {
        try {
            await studentService.createStudent(data);
            toast.success("Student created successfully.");
            fetchStudents();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create student.");
            return false;
        }
    };

    const updateParams = (newParams: Partial<GetStudentsParams>) => {
        setParams((prev: GetStudentsParams) => ({ ...prev, ...newParams }));
    };

    return {
        students,
        loading,
        total,
        totalPages,
        params,
        updateParams,
        createStudent,
        refresh: fetchStudents
    };
}
