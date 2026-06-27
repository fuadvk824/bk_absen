import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';

import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaginationMeta } from '@/types/pagination';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LaravelPagination } from './pagination';

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    meta: PaginationMeta;
    searchValue?: string;
    onSearch?: (value: string) => void;
    placeholder?: string;

    columnVisibility: VisibilityState;
    onColumnVisibilityChange?: (value: VisibilityState) => void;
}

export function DataTable<TData>({
    columns,
    data,
    meta,
    searchValue,
    onSearch,
    placeholder,
    columnVisibility,
    onColumnVisibilityChange,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility: columnVisibility ?? {},
            sorting,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: (updater) => {
            if (!onColumnVisibilityChange) return;

            if (typeof updater === 'function') {
                onColumnVisibilityChange(updater(columnVisibility));
            } else {
                onColumnVisibilityChange(updater);
            }
        },

        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                {onSearch && (
                    <Input
                        placeholder={placeholder || 'Search...'}
                        defaultValue={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        className="max-w-sm"
                    />
                )}

                <div className="flex items-center justify-between">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                            >
                                Columns
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="w-56">
                            {table.getAllLeafColumns().map((column) => {
                                const label =
                                    typeof column.columnDef.header === 'string'
                                        ? column.columnDef.header
                                        : column.id;

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead
                                        key={h.id}
                                        className="cursor-pointer select-none"
                                        onClick={h.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(
                                                h.column.columnDef.header,
                                                h.getContext(),
                                            )}
                                            {{
                                                asc: ' ▲',
                                                desc: ' ▼',
                                            }[
                                                h.column.getIsSorted() as string
                                            ] ?? null}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center"
                                >
                                    No data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="text-sm text-muted-foreground">
                    {meta.total && (
                        <span className="ml-1">
                            showing {data.length} of {meta.total} results
                        </span>
                    )}
                </div>
                <LaravelPagination meta={meta} className="mt-4" />
            </div>
        </div>
    );
}