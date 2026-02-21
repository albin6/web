import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import type { ToolStudent } from '../types/toolTypes';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ToolStudentsTableProps {
    data: ToolStudent[];
    loading: boolean;
    page: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const statusStyles: Record<string, string> = {
    Ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    Terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    Placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Quit: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    "Pre-Batch": "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

export function ToolStudentsTable({
    data,
    loading,
    page,
    totalCount,
    pageSize,
    onPageChange
}: ToolStudentsTableProps) {
    const columns: ColumnDef<ToolStudent>[] = [
        {
            accessorKey: 'name',
            header: 'Full Name',
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('name')}</span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">{row.getValue('email')}</span>
            ),
        },
        {
            accessorKey: 'mobile',
            header: 'Mobile',
        },
        {
            accessorKey: 'batchName',
            header: 'Batch',
        },
        {
            accessorKey: 'course',
            header: 'Course',
        },
        {
            accessorKey: 'domainName',
            header: 'Domain',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const style = statusStyles[status] || "bg-secondary text-secondary-foreground border-secondary";
                return (
                    <Badge className={cn("border font-medium", style)} variant="outline">
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'createdOn',
            header: 'Joined On',
            cell: ({ row }) => {
                try {
                    return (
                        <span className="text-muted-foreground text-sm">
                            {format(new Date(row.getValue('createdOn')), 'MMM d, yyyy')}
                        </span>
                    );
                } catch {
                    return row.getValue('createdOn');
                }
            },
        },
    ];

    const totalPages = Math.ceil(totalCount / pageSize);

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold text-foreground whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="whitespace-nowrap">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Users className="h-8 w-8 opacity-40" />
                                            <p className="font-medium">No students found</p>
                                            <p className="text-sm">Try adjusting your filters or search term.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages || 1}</span>
                    <span className="hidden sm:inline"> · {totalCount.toLocaleString()} total students</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1 || loading}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                        className="gap-1"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
