import { Head, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

import { RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

import type { PaginationMeta } from '@/types/pagination';
import { columnAssignLeave } from './column-assignLeave';

export interface Employee {
    id: number;
    name: string;

    office: {
        name: string;
    };
    masa_kerja: number;
    eligible: boolean;
    already_assigned: boolean;
}

interface Props {
    leave: {
        id: number;
        leave_name: string;
        max_days: number;
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
        office_id?: number;
        name?: string;
        masa_kerja?: number;
        perPage?: number;
    };
}

export default function AssignLeave({ leave, employees, offices, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        office_id: filters.office_id ?? undefined,
        name: filters.name ?? '',
        masa_kerja: filters.masa_kerja ?? undefined,
        perPage: filters.perPage ?? 10,
    });

    const handleFilterChange = <K extends keyof typeof localFilters>(key: K, value: (typeof localFilters)[K]) => {
        const updated = {
            ...localFilters,
            [key]: value,
        };

        setLocalFilters(updated);

        router.get(
            route('leaveassign.edit', {
                leave: leave.id,
            }),
            {
                ...updated,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    };

    const handleSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error('Pilih minimal 1 karyawan');
            return;
        }

        router.patch(
            route('leaveassign.patch', {
                leave: leave.id,
            }),
            {
                employee_ids: selectedIds,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    handleToast(page);

                    setSelectedIds([]);
                },
            },
        );
    };

    const handleResetFilters = () => {
        setIsRefreshing(true);

        const defaults = {
            office_id: undefined,
            name: '',
            masa_kerja: undefined,
            perPage: 10,
        };

        setLocalFilters(defaults);

        router.get(
            route('leaveassign.edit', {
                leave: leave.id,
            }),
            defaults,
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Kategori Cuti',
                    href: route('leave.index'),
                },
                {
                    title: 'Assign',
                    href: route('leaveassign.edit', {
                        leave: leave.id,
                    }),
                },
            ]}
        >
            <Head title="Assign Leave" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{leave.leave_name}</h1>

                        <p className="text-xs text-muted-foreground">Masa bakti {leave.max_days} bulan ~ Kuota {leave.max_days} hari</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters}>
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button>
                                    <Save />
                                    Simpan
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <Save />
                                    </AlertDialogMedia>

                                    <AlertDialogTitle>Assign Leave</AlertDialogTitle>

                                    <AlertDialogDescription>
                                        Apakah yakin ingin memberikan hak cuti kepada karyawan yang dipilih?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                                    <AlertDialogAction onClick={handleSubmit}>Simpan</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Cari Karyawan</Label>

                        <Input
                            value={localFilters.name}
                            placeholder="Cari nama..."
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Office</Label>

                        <Select
                            value={localFilters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange('office_id', value === 'all' ? undefined : Number(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
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
                    <div className="space-y-1">
                        <Label>Masa Kerja</Label>

                        <Select
                            value={localFilters.masa_kerja?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange('masa_kerja', value === 'all' ? undefined : Number(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Masa Kerja" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Masa Kerja</SelectItem>
                                <SelectItem value="4">≥ 4 Bulan</SelectItem>
                                <SelectItem value="12">≥ 1 Tahun</SelectItem>
                                <SelectItem value="24">≥ 2 Tahun</SelectItem>
                                <SelectItem value="36">≥ 3 Tahun</SelectItem>
                                <SelectItem value="60">≥ 5 Tahun</SelectItem>
                                <SelectItem value="120">≥ 10 Tahun</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<Employee>
                    columns={columnAssignLeave(employees.data, selectedIds, setSelectedIds)}
                    data={employees.data}
                    meta={employees.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange('perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
