import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/table/datatable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import { useTableActions } from '@/lib/useTableAction';
import { columnWorkSchedules } from './column-workschedule';
import { Shift, WorkSchedule } from '@/types/data-karyawan/work-schedule-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

interface Option {
    id: number;
    name: string;
}

interface PeriodDate {
    date: string;
    day: number;
    month: number;
    year: number;
    day_name: string;
}

interface Props {
    employees: {
        data: WorkSchedule[];
        meta: PaginationMeta;
    };
    periodDates: PeriodDate[];
    periodLabel: string;
    offices: Option[];
    shifts: Shift[];
    filters: {
        search: string;
        office_id: number;
        month?: number;
        year?: number;
        perPage?: number;
    };
}

export default function Index({ employees, filters, periodDates, periodLabel, offices, shifts }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['employee_code', 'employee_name'];

    const today = new Date();
    const defaultMonth = today.getDate() >= 26 ? today.getMonth() + 1 : today.getMonth();

    const [localFilters, setLocalFilters] = useState<{
        search: string;
        office_id?: number;
        month: number;
        year: number;
        perPage: number;
    }>({
        search: filters.search ?? '',
        office_id: filters.office_id ?? undefined,
        month: filters.month ?? defaultMonth,
        year: filters.year ?? new Date().getFullYear(),
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'workschedule.index',
        exportRoute: 'workschedule.export',
        allColumns,
    });

    const employeesOptimized = employees.data.map((emp) => {
        const schedule = emp.work_schedule?.[0] ?? null;
        const dayMap: Record<string, any> = {};

        schedule?.days?.forEach((d) => {
            dayMap[d.work_date] = d;
        });

        return {
            ...emp,
            dayMap,
        };
    });

    const bulkRow: WorkSchedule = {
        id: 0, 
        name: 'Atur Semua',
        shift: {} as Shift, 
        work_schedule: [],
        dayMap: {},
        is_bulk: true,
    };

    const employeesWithBulk = [bulkRow, ...employeesOptimized];
  
    const columns = useMemo(
        () =>
            columnWorkSchedules(periodDates, shifts, {
                office_id: localFilters.office_id,
            }),
        [periodDates, shifts, localFilters.office_id],
    );

    const months = [
        { value: 12, label: '26 Des - 25 Jan' },
        { value: 1, label: '26 Jan - 25 Feb' },
        { value: 2, label: '26 Feb - 25 Mar' },
        { value: 3, label: '26 Mar - 25 Apr' },
        { value: 4, label: '26 Apr - 25 Mei' },
        { value: 5, label: '26 Mei - 25 Jun' },
        { value: 6, label: '26 Jun - 25 Jul' },
        { value: 7, label: '26 Jul - 25 Ags' },
        { value: 8, label: '26 Ags - 25 Sep' },
        { value: 9, label: '26 Sep - 25 Okt' },
        { value: 10, label: '26 Okt - 25 Nov' },
        { value: 11, label: '26 Nov - 25 Des' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 2 + i);

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            office_id: undefined,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('workschedule.index'),
            {},
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Work Schedule', href: route('workschedule.index') }]}>
            <Head title="Work Schedule" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Jadwal Kerja </h1>
                        <span>-</span>
                        <span className="text-sm">{periodLabel}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => handleExport(columnVisibility)} className="cursor-pointer">
                            <FileSpreadsheet className="h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Search Nama</Label>
                        <Input
                            value={localFilters.search ?? ''}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            placeholder="Cari nama..."
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
                                <SelectValue placeholder="Pilih kantor" />
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
                        <Label>Bulan</Label>
                        <Select
                            value={localFilters.month?.toString()}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'month', Number(value))
                            }
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value.toString()}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Tahun</Label>
                        <Select
                            value={localFilters.year?.toString()}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'year', Number(value))
                            }
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<WorkSchedule>
                    columns={columns}
                    // data={employeesOptimized}
                    data={employeesWithBulk}
                    meta={employees.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
