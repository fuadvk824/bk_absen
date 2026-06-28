import { Head, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { PaginationMeta } from '@/types/pagination';
import { columnAssignShift } from './column-assignshift';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Save } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export interface Employee {
    id: number;
    office_id: number;
    shift_id?: number | null;
    name: string;
    office: {
        name: string;
    };
    shift?: {
        id: number;
        name_shift: string;
    } | null;
}

interface Props {
    shift: {
        id: number;
        name_shift: string;
    };
    employees: {
        data: Employee[];
        meta: PaginationMeta;
    };
    offices: {
        id: number;
        name: string;
    }[];
    filters: {
        name?: string;
        office_id?: number;
        perPage?: number;
    };
    currentPeriod: string;
}

export default function AssignEmployees({ shift, employees, offices, filters, currentPeriod }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        office_id: filters.office_id ?? undefined,
        name: filters.name ?? '',
        perPage: filters.perPage ?? 10,
    });

    const handleFilterChange = <K extends keyof typeof localFilters>(key: K, value: (typeof localFilters)[K]) => {
        const updated: typeof localFilters = {
            ...localFilters,
            [key]: value,
        };

        setLocalFilters(updated);

        router.get(
            route('assign.edit', { shift: shift.id }),
            {
                ...updated,
                page: 1, // reset
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };
    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    };

    const handleSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error('Pilih minimal 1 karyawan');
            return;
        }

        router.patch(
            route('assign.patch', { shift: shift.id }),
            { employee_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: handleToast,
            },
        );
    };

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            name: '',
            office_id: undefined,
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('assign.edit', { shift: shift.id }),
            {
                name: '',
                office_id: undefined,
                perPage: 10,
            },
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Shift', href: route('shift.index') },
                {
                    title: 'Assign',
                    href: route('assign.edit', { shift: shift.id }),
                },
            ]}
        >
            <Head title="Assign Shift" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-baseline gap-0 sm:flex-row sm:items-center sm:gap-2">
                        <h1 className="text-lg font-semibold sm:text-xl">Shift: {shift.name_shift}</h1>

                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground sm:text-sm">(Periode : {currentPeriod})</span>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
                                    </TooltipTrigger>

                                    <TooltipContent className="max-w-xs">
                                        <p>
                                            Menyimpan shift sekarang akan membuat jadwal kerja untuk periode
                                            <strong> {currentPeriod}</strong>.
                                        </p>
                                        <p className="mt-2">
                                            Jika dilakukan mulai tanggal <strong>20 keatas</strong>, jadwal akan dibuat untuk
                                            periode berikutnya.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:block">Refresh</span>
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="cursor-pointer">
                                    <Save />
                                    <span className="hidden sm:block">Simpan</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <Save />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Assign Employee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin menetapkan shift pada data karyawan yang dipilih?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer" onClick={handleSubmit}>
                                        Simpan Assign
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Cari Nama Karyawan</Label>

                        <Input
                            value={localFilters.name ?? ''}
                            placeholder="Cari nama..."
                            className="placeholder:text-xs"
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Filter Office</Label>

                        <Select
                            value={localFilters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange('office_id', value === 'all' ? undefined : Number(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Office" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Office</SelectItem>

                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={office.id.toString()}>
                                        {office.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<Employee>
                    columns={columnAssignShift(shift.id, employees.data, selectedIds, setSelectedIds)}
                    data={employees.data}
                    meta={employees.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value: number) => handleFilterChange('perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
