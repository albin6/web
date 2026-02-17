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
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface ToolStudentsTableProps {
    data: ToolStudent[];
    loading: boolean;
    page: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function ToolStudentsTable({
    data,
    loading,
    page,
    totalCount,
    pageSize,
    onPageChange
}: ToolStudentsTableProps) {

    // Columns definition
    const columns: ColumnDef<ToolStudent>[] = [
        {
            accessorKey: 'name',
            header: 'Full Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
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
            header: 'Program Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <Badge variant="secondary">
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
                    return format(new Date(row.getValue('createdOn')), 'MMM d, yyyy');
                } catch (e) {
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
                    page {page} of {totalPages || 1} ({totalCount} items)
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || loading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
