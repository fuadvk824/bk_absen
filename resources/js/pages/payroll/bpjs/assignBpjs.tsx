import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type { VisibilityState } from '@tanstack/react-table';
import type { PaginationMeta } from '@/types/pagination';
import { columnAssignBpjs } from './column-assignBpjs';
import { RefreshCw } from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    office: {
        name: string;
    };
    masa_kerja: string;
    masa_kerja_bulan: number;
    eligible: boolean;
    already_assigned: boolean;
    bpjs: number | null;
}

interface Props {
    employees: {
        data: Employee[];
        meta: PaginationMeta;
    };
    offices: {
        id: number;
        name: string;
    }[];
    filters: {
        office_id?: string | number | null;
        name?: string | null;
        masa_kerja?: string | number | null;
        status?: string;
        perPage?: number;
    };
}

export default function AssignBpjs({ employees, offices, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [visibility, setVisibility] = useState<VisibilityState>({});
    const [saving, setSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [local, setLocal] = useState({
        office_id: filters.office_id ? String(filters.office_id) : 'all',
        name: filters.name ?? '',
        masa_kerja: filters.masa_kerja ? String(filters.masa_kerja) : 'all',
        status: filters.status ?? 'all',
        perPage: filters.perPage ?? 10,
    });

    const handleFilter = (key: keyof typeof local, value: string | number) => {
        const next = {
            ...local,
            [key]: value,
        };

        setLocal(next);
        setSelectedIds([]);

        router.get(
            route('bpjsassign.edit'),
            {
                ...next,
                office_id: next.office_id === 'all' ? '' : next.office_id,
                masa_kerja: next.masa_kerja === 'all' ? '' : next.masa_kerja,
                status: next.status,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error('Pilih minimal 1 karyawan');
            return;
        }

        setSaving(true);

        router.patch(
            route('bpjsassign.patch'),
            {
                employee_ids: selectedIds,
            },
            {
                preserveScroll: true,

                onSuccess: (page) => {
                    const flash = page.props.flash as {
                        success?: string;
                        error?: string;
                    };

                    if (flash.success) {
                        toast.success(flash.success);
                    }

                    if (flash.error) {
                        toast.error(flash.error);
                    }

                    setSelectedIds([]);
                },

                onError: (errors) => {
                    Object.values(errors).forEach((message) => {
                        toast.error(String(message));
                    });
                },

                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    };

    const handleResetFilters = () => {
        setIsRefreshing(true);

        const defaults = {
            office_id: 'all',
            name: '',
            masa_kerja: 'all',
            status: 'all',
            perPage: 10,
        };

        setLocal(defaults);
        setSelectedIds([]);

        router.get(
            route('bpjsassign.edit'),
            {
                office_id: '',
                name: '',
                masa_kerja: '',
                status: 'all',
                perPage: 10,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Karyawan',
                    href: '#',
                },
                {
                    title: 'Assign BPJS',
                    href: route('bpjsassign.edit'),
                },
            ]}
        >
            <Head title="Assign BPJS" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Assign BPJS</h1>

                        <p className="text-sm text-muted-foreground">Masa kerja minimal 18 bulan</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            disabled={isRefreshing}
                            className="cursor-pointer"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:block">Refresh</span>
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={saving || selectedIds.length === 0}>
                                    {saving ? 'Menyimpan...' : `Simpan BPJS (${selectedIds.length})`}
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Assign BPJS</AlertDialogTitle>

                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin melakukan assign BPJS kepada {selectedIds.length} karyawan
                                        terpilih? Nominal BPJS akan mengikuti daily salary masing-masing karyawan dan
                                        memperbarui data salary yang sudah ada.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>

                                    <AlertDialogAction onClick={handleSubmit} disabled={saving}>
                                        Konfirmasi
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Cari Karyawan</Label>

                        <Input
                            value={local.name}
                            placeholder="Cari nama..."
                            onChange={(e) => handleFilter('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Office</Label>

                        <Select value={local.office_id} onValueChange={(value) => handleFilter('office_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih office" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Office</SelectItem>

                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={String(office.id)}>
                                        {office.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Masa Kerja</Label>

                        <Select value={local.masa_kerja} onValueChange={(value) => handleFilter('masa_kerja', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua masa kerja" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Masa Kerja</SelectItem>

                                <SelectItem value="18">≥ 18 Bulan</SelectItem>

                                <SelectItem value="24">≥ 2 Tahun</SelectItem>

                                <SelectItem value="36">≥ 3 Tahun</SelectItem>

                                <SelectItem value="60">≥ 5 Tahun</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Status Assign BPJS</Label>

                        <Select value={local.status} onValueChange={(value) => handleFilter('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>

                                <SelectItem value="assigned">Sudah Assign</SelectItem>

                                <SelectItem value="unassigned">Belum Assign</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<Employee>
                    columns={columnAssignBpjs(employees.data, selectedIds, setSelectedIds)}
                    data={employees.data}
                    meta={employees.meta}
                    columnVisibility={visibility}
                    onColumnVisibilityChange={setVisibility}
                    perPage={local.perPage}
                    onPerPageChange={(value) => handleFilter('perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
