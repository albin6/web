import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentToolService } from '../services/studentToolService';
import { ToolStudentsTable } from '../components/ToolStudentsTable';
import { StudentFilters } from '../components/StudentFilters';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/useDebounce';

export default function StudentsPage() {
    console.log("DEBUG: Rendering NEW StudentsPage with Tool API");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<{
        batchId?: string;
        courseId?: string;
        domainId?: string;
        statusCodes?: string;
    }>({
        statusCodes: "2" // Default to Student (Active)
    });

    const debouncedSearch = useDebounce(search, 500);
    const debouncedFilters = useDebounce(filters, 300);
    const pageSize = 10;

    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['tool-students', page, debouncedSearch, debouncedFilters],
        queryFn: () => studentToolService.getStudents({
            page,
            pageSize,
            searchKey: debouncedSearch,
            ...debouncedFilters
        }),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    });

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to page 1 on filter change
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                <p className="text-muted-foreground">
                    Manage your students, view their details, and add new ones.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={handleSearchChange}
                        className="max-w-sm"
                    />
                    {/* Add Create Button here if needed */}
                </div>

                <StudentFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <ToolStudentsTable
                    data={studentsData?.data || []}
                    loading={isLoading}
                    page={page}
                    totalCount={parseInt(studentsData?.totalCount || "0")}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
