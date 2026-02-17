import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query";
import { studentToolService } from "../services/studentToolService";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StudentFiltersProps {
    filters: {
        batchId?: string;
        courseId?: string;
        domainId?: string;
        statusCodes?: string;
    };
    onFilterChange: (key: string, value: string | undefined) => void;
}

export function StudentFilters({ filters, onFilterChange }: StudentFiltersProps) {
    const { data: batches } = useQuery({
        queryKey: ['tool-batches'],
        queryFn: studentToolService.getBatches
    });

    const { data: courses } = useQuery({
        queryKey: ['tool-courses'],
        queryFn: studentToolService.getCourses
    });

    const { data: domains } = useQuery({
        queryKey: ['tool-domains'],
        queryFn: studentToolService.getDomains
    });

    const { data: statusOptions } = useQuery({
        queryKey: ['tool-status-options'],
        queryFn: () => studentToolService.getStatusOptions('student_status')
    });

    return (
        <div className="flex flex-wrap gap-4 items-center">
            {/* Batch Filter */}
            <Select
                value={filters.batchId || "all"}
                onValueChange={(val) => onFilterChange('batchId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Batch" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches?.data?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Course Filter */}
            <Select
                value={filters.courseId || "all"}
                onValueChange={(val) => onFilterChange('courseId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Course" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.data?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Domain Filter */}
            <Select
                value={filters.domainId || "all"}
                onValueChange={(val) => onFilterChange('domainId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Domain" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains?.data?.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
                value={filters.statusCodes || "all"}
                onValueChange={(val) => onFilterChange('statusCodes', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions?.data?.map((status) => (
                        <SelectItem key={status.id} value={status.code.toString()}>{status.meaning}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(filters.batchId || filters.courseId || filters.domainId || filters.statusCodes) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        onFilterChange('batchId', undefined);
                        onFilterChange('courseId', undefined);
                        onFilterChange('domainId', undefined);
                        onFilterChange('statusCodes', undefined);
                    }}
                    className="h-8 lg:px-3"
                >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
