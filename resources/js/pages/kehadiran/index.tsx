import { Head, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { AttendanceList } from '@/types/kehadiran/attendanceList';
import type { PaginationMeta } from '@/types/pagination';
import { columnAttendances } from './column-attendance';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useTableActions } from '@/lib/useTableAction';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface Option {
    id: number;
    name: string;
}
interface Option1 {
    id: number;
    name_shift: string;
}

interface Props {
    attendances: {
        data: AttendanceList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        office_ids?: number[];
        department_id?: number;
        shift_id?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
        perPage?: number;
    };
    offices: Option[];
    departments: Option[];
    shifts: Option1[];
}

export default function Index({ attendances, filters, offices, departments, shifts }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const allColumns = [
        'nama_karyawan',
        'check_in',
        'gambar_checkin',
        'status_checkin',
        'check_out',
        'gambar_checkout',
        'status_checkout',
        'total_waktu',
        'name_shift',
        'checkin_time',
        'checkout_time',
        'late_proof', 
        'late_reason'
    ];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        office_ids: filters.office_ids ?? [],
        department_id: filters.department_id ?? undefined,
        shift_id: filters.shift_id ?? undefined,
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        status: filters.status ?? undefined,
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'attendance.index',
        exportRoute: 'attendance.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            office_ids: [],
            department_id: undefined,
            shift_id: undefined,
            start_date: '',
            end_date: '',
            status: undefined,
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('attendance.index'),
            {},
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kehadiran', href: route('attendance.index') }]}>
            <Head title="Kehadiran" />

            <div className="space-y-4 p-5 text-sm">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Kehadiran</h1>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => handleExport(columnVisibility)}>
                            <FileSpreadsheet className="h-4 w-4" />
                            Export
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
                            className="h-7 bg-white p-4 placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Tipe Shift</Label>
                        <Select
                            value={localFilters.shift_id?.toString() ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'shift_id', value)}
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Pilih shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Shift</SelectItem>
                                {shifts.map((shf) => (
                                    <SelectItem key={shf.id} value={shf.id.toString()}>
                                        {shf.name_shift}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Kantor</Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-7 w-full justify-between bg-white p-4 font-normal">
                                    {localFilters.office_ids.length > 0
                                        ? `${localFilters.office_ids.length} kantor dipilih`
                                        : 'Pilih kantor'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-64">
                                <div className="space-y-2">
                                    {offices.map((office) => {
                                        const checked = localFilters.office_ids.includes(office.id);

                                        return (
                                            <div key={office.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(value) => {
                                                        let updated = [...localFilters.office_ids];

                                                        if (value) {
                                                            updated.push(office.id);
                                                        } else {
                                                            updated = updated.filter((id) => id !== office.id);
                                                        }

                                                        handleFilterChange(
                                                            localFilters,
                                                            setLocalFilters,
                                                            'office_ids',
                                                            updated,
                                                        );
                                                    }}
                                                />

                                                <Label className="font-normal">{office.name}</Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1">
                        <Label>Departemen</Label>
                        <Select
                            value={localFilters.department_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'department_id', value)
                            }
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Pilih departemen" />
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
                        <Label>Status Kehadiran</Label>
                        <Select
                            value={localFilters.status ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'status', value)}
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="tepat_waktu">Tepat Waktu</SelectItem>
                                <SelectItem value="terlambat">Terlambat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Periode</Label>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-7 flex-1 justify-start bg-white p-4 font-normal">
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
                                    <Button variant="outline" className="h-7 flex-1 justify-start bg-white p-4 font-normal">
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

                <DataTable<AttendanceList>
                    columns={columnAttendances}
                    data={attendances.data}
                    meta={attendances.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
