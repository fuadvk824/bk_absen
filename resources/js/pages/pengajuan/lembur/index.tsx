import { Head, Link, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useTableActions } from '@/lib/useTableAction';
import { OvertimeList } from '@/types/pengajuan/overtimeList';
import { columnOvertime } from './column-overtime';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface Option {
    id: number;
    name: string;
}

interface Props {
    overtimes: {
        data: OvertimeList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        office_id?: number;
        department_id?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
        perPage?: number;
    };
    offices: Option[];
    departments: Option[];
}

export default function Index({ overtimes, filters, offices, departments }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['employee_name', 'date', 'waktu', 'reason', 'status', 'created_at'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        office_id: filters.office_id ?? undefined,
        department_id: filters.department_id ?? undefined,
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        status: filters.status ?? undefined,
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'overtime.index',
        exportRoute: 'overtime.export',
        allColumns,
    });
    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            office_id: undefined,
            department_id: undefined,
            start_date: '',
            end_date: '',
            status: undefined,
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('overtime.index'),
            {},
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };
    return (
        <AppLayout breadcrumbs={[{ title: 'Pengajuan Lembur', href: route('overtime.index') }]}>
            <Head title="Lembur" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Lembur</h1>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => handleExport(columnVisibility)}>
                            <FileSpreadsheet className="h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Karyawan</Label>
                        <Input
                            placeholder="Cari nama karyawan..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Kantor</Label>
                        <Select
                            value={localFilters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'office_id', value)}
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih Kantor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kantor</SelectItem>
                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={office.id.toString()}>
                                        {office.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Departemen</Label>
                        <Select
                            value={localFilters.department_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'department_id', value)
                            }
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih Departemen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Departemen</SelectItem>
                                {departments.map((dep) => (
                                    <SelectItem key={dep.id} value={dep.id.toString()}>
                                        {dep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Status</Label>
                        <Select
                            value={localFilters.status ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'status', value)}
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Periode</Label>

                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-7 flex-1 justify-start p-4 font-normal">
                                        <CalendarIcon className="h-3 w-3" />
                                        {localFilters.start_date
                                            ? format(new Date(localFilters.start_date), 'dd/MM/yyyy')
                                            : 'From'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.start_date ? new Date(localFilters.start_date) : undefined}
                                        onSelect={(date) =>
                                            handleFilterChange(
                                                localFilters,
                                                setLocalFilters,
                                                'start_date',
                                                date ? format(date, 'yyyy-MM-dd') : '',
                                            )
                                        }
                                        captionLayout="dropdown"
                                        fromYear={2000}
                                        toYear={2050}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="text-[10px] whitespace-nowrap text-muted-foreground">s/d</span>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-7 flex-1 justify-start p-4 font-normal">
                                        <CalendarIcon className="h-3 w-3" />
                                        {localFilters.end_date
                                            ? format(new Date(localFilters.end_date), 'dd/MM/yyyy')
                                            : 'To'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.end_date ? new Date(localFilters.end_date) : undefined}
                                        onSelect={(date) =>
                                            handleFilterChange(
                                                localFilters,
                                                setLocalFilters,
                                                'end_date',
                                                date ? format(date, 'yyyy-MM-dd') : '',
                                            )
                                        }
                                        captionLayout="dropdown"
                                        fromYear={2000}
                                        toYear={2050}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <DataTable<OvertimeList>
                    columns={columnOvertime}
                    data={overtimes.data}
                    meta={overtimes.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
