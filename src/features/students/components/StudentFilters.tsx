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
        queryFn: studentToolService.getBatches,
        staleTime: 1000 * 60 * 30,
    });

    const { data: courses } = useQuery({
        queryKey: ['tool-courses'],
        queryFn: studentToolService.getCourses,
        staleTime: 1000 * 60 * 30,
    });

    const { data: domains } = useQuery({
        queryKey: ['tool-domains'],
        queryFn: studentToolService.getDomains,
        staleTime: 1000 * 60 * 30,
    });

    const { data: statusOptions } = useQuery({
        queryKey: ['tool-status-options'],
        queryFn: () => studentToolService.getStatusOptions('student_status'),
        staleTime: 1000 * 60 * 30,
    });

    const activeFilterCount = [filters.batchId, filters.courseId, filters.domainId, filters.statusCodes].filter(Boolean).length;

    return (
        <div className="flex flex-wrap gap-2 items-center">
            <Select
                value={filters.batchId || "all"}
                onValueChange={(val) => onFilterChange('batchId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches?.data?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.courseId || "all"}
                onValueChange={(val) => onFilterChange('courseId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.data?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.domainId || "all"}
                onValueChange={(val) => onFilterChange('domainId', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains?.data?.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.statusCodes || "all"}
                onValueChange={(val) => onFilterChange('statusCodes', val === "all" ? undefined : val)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions?.data?.map((status) => (
                        <SelectItem key={status.id} value={status.code.toString()}>{status.meaning}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        onFilterChange('batchId', undefined);
                        onFilterChange('courseId', undefined);
                        onFilterChange('domainId', undefined);
                        onFilterChange('statusCodes', undefined);
                    }}
                    className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    Reset
                    <X className="h-3.5 w-3.5" />
                    {activeFilterCount > 1 && (
                        <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            )}
        </div>
    );
}
