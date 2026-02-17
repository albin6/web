import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Student } from '@/types/api';
import { format } from 'date-fns';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { CreateStudentDialog } from './CreateStudentDialog';
import { useStudents } from '../hooks/useStudents';

export function StudentsTable() {
    const {
        students,
        loading,
        totalPages,
        params,
        updateParams,
        createStudent,
    } = useStudents();

    // Columns definition
    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: 'full_name',
            header: ({ column: _column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => handleSort('full_name')}
                    >
                        Full Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: 'email',
            header: ({ column: _column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => handleSort('email')}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'program_status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('program_status') as boolean;
                return (
                    <Badge variant={status ? 'default' : 'secondary'}>
                        {status ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column: _column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                    >
                        Created At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return format(new Date(row.getValue('created_at')), 'MMM d, yyyy');
            },
        },
    ];

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: totalPages,
    });

    const handleSort = (field: string) => {
        const isSameField = params.sort_by === field;
        const newOrder = isSameField && params.order === 'asc' ? 'desc' : 'asc';
        updateParams({
            sort_by: field,
            order: newOrder,
            page: 1
        });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateParams({ search: e.target.value, page: 1 });
    };

    const handleStatusFilter = (value: string) => {
        updateParams({
            program_status: value === 'all' ? undefined : value === 'active',
            page: 1
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            updateParams({ page: newPage });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search students..."
                        value={params.search || ''}
                        onChange={handleSearch}
                        className="max-w-sm"
                    />
                    <Select onValueChange={handleStatusFilter} defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <CreateStudentDialog onCreate={createStudent} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        <Spinner size="lg" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {params.page} of {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((params.page || 1) - 1)}
                    disabled={!params.page || params.page <= 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((params.page || 1) + 1)}
                    disabled={!params.page || params.page >= totalPages || loading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
