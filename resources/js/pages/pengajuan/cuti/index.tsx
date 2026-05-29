import { Head, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { useTableActions } from '@/lib/useTableAction';
import { columnLeave } from './column-leave';

import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { LeaveSubmitList } from '@/types/pengajuan/leavesubmitList';

interface Option {
    id: number;
    name?: string;
    leave_name?: string;
}

interface Props {
    leaves: {
        data: LeaveSubmitList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        office_id?: number;
        leave_category_id?: number;
        status?: string;
        perPage?: number;
    };
    offices: Option[];
    leaveCategories: Option[];
}

export default function Index({ leaves, filters, offices, leaveCategories }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const allColumns = ['employee_name', 'leave_category', 'start_date', 'end_date', 'total_days', 'status'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        office_id: filters.office_id ?? undefined,
        leave_category_id: filters.leave_category_id ?? undefined,
        status: filters.status ?? undefined,
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'leavesubmit.index',
        exportRoute: 'leavesubmit.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            office_id: undefined,
            leave_category_id: undefined,
            status: undefined,
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('leavesubmit.index'),
            {},
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengajuan Cuti', href: route('leavesubmit.index') }]}>
            <Head title="Cuti" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Pengajuan Cuti</h1>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters}>
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
                            placeholder="Cari..."
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
                        <Label>Kategori Cuti</Label>
                        <Select
                            value={localFilters.leave_category_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'leave_category_id', value)
                            }
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {leaveCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.leave_name}
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
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<LeaveSubmitList>
                    columns={columnLeave}
                    data={leaves.data}
                    meta={leaves.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
