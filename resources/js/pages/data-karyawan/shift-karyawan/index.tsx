import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { VisibilityState } from '@tanstack/react-table';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import { useTableActions } from '@/lib/useTableAction';
import { route } from 'ziggy-js';
import type { Shift } from '@/types/kategori-masterdata/shiftList';
import { columnSkenarioKerja } from './column-skenario-kerja';
import { AlarmClockPlus, FileSpreadsheet, Plus, RefreshCw } from 'lucide-react';

interface Props {
    shifts: {
        data: Shift[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        perPage?: number;
    };
}

export default function Index({ shifts, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['shift_code', 'name_shift', 'toleransi_late', 'denda_alpha', 'created_at'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'shift.index',
        exportRoute: 'shift.export',
        allColumns,
    });
    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(route('shift.index'), {}, { replace: true, onFinish: () => setIsRefreshing(false) });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Shift', href: route('shift.index') }]}>
            <Head title="Shift" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Data Shift</h1>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => handleExport(columnVisibility)}>
                            <FileSpreadsheet className="h-4 w-4" />
                            Export
                        </Button>

                        <Link href={route('shift.create')}>
                            <Button>
                                {' '}
                                <AlarmClockPlus className="h-4 w-4" />
                                Shift
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Shift</Label>
                        <Input
                            placeholder="Cari nama shift..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7  p-4 placeholder:text-xs"
                        />
                    </div>
                </div>

                <DataTable<Shift>
                    columns={columnSkenarioKerja}
                    data={shifts.data}
                    meta={shifts.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
