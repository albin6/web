import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentToolService } from '../services/studentToolService';
import { ToolStudentsTable } from '../components/ToolStudentsTable';
import { StudentFilters } from '../components/StudentFilters';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/useDebounce';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function StudentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<{
        batchId?: string;
        courseId?: string;
        domainId?: string;
        statusCodes?: string;
    }>({
        statusCodes: "2"
    });

    const debouncedSearch = useDebounce(search, 600);
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
        placeholderData: (previousData) => previousData,
    });

    const totalCount = parseInt(studentsData?.totalCount || "0");

    const handleFilterChange = (key: string, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    {!isLoading && totalCount > 0 && (
                        <Badge variant="secondary" className="text-sm">
                            {totalCount.toLocaleString()}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">
                    Manage and view student details from the Tool API.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={search}
                            onChange={handleSearchChange}
                            className="pl-9"
                        />
                    </div>
                </div>

                <StudentFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <ToolStudentsTable
                    data={studentsData?.data || []}
                    loading={isLoading}
                    page={page}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
