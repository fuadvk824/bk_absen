import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import type { OvertimeRate } from '@/types/type-table/overtime-rate';

import { useTableActions } from '@/lib/useTableAction';

import { Label } from '@/components/ui/label';
import { AlarmClockPlus, Cog, FileSpreadsheet, RefreshCw } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { columnOvertimeRates } from './column-overtime-rate';
import Form from './form';

interface Props {
    overtimeRates: {
        data: OvertimeRate[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        perPage?: number;
    };
}

export default function Index({ overtimeRates, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isRefreshing, setIsRefreshing] = useState(false);

    const allColumns = ['name', 'rate_per_hour', 'effective_from', 'is_active'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'overtime-rate.index',
        exportRoute: 'overtime-rate.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);

        const defaultFilters = {
            search: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('overtime-rate.index'),
            {},
            {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    const [open, setOpen] = useState(false);

    const [selectedOvertimeRate, setSelectedOvertimeRate] = useState<OvertimeRate | null>(null);

    const openCreate = () => {
        setSelectedOvertimeRate(null);
        setOpen(true);
    };

    const openEdit = (overtimeRate: OvertimeRate) => {
        setSelectedOvertimeRate(overtimeRate);
        setOpen(true);
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Bonus Lembur',
                    href: route('overtime-rate.index'),
                },
            ]}
        >
            <Head title="Bonus Lembur" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold ">
                        <span className="hidden sm:inline">Data</span> Bonus Lembur
                    </h1>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:block">Refresh</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleExport(columnVisibility)}
                            className="cursor-pointer text-xs"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="hidden sm:block">Export</span>
                        </Button>

                        <Button className="cursor-pointer text-xs" onClick={openCreate} disabled>
                            <AlarmClockPlus className="h-4 w-4" />
                            <span className="hidden sm:block">Tambah</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Nama Bonus Lembur</Label>

                        <Input
                            placeholder="Cari nama lembur..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedOvertimeRate ? 'Edit Bonus Lembur' : 'Tambah Bonus Lembur'}</DialogTitle>

                            <DialogDescription>
                                {selectedOvertimeRate
                                    ? 'Perbarui data bonus lembur yang dipilih dan simpan perubahan.'
                                    : 'Tambahkan bonus lembur baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            close={() => setOpen(false)}
                            initialData={
                                selectedOvertimeRate
                                    ? {
                                          id: selectedOvertimeRate.id,
                                          name: selectedOvertimeRate.name,
                                          rate_per_hour: selectedOvertimeRate.rate_per_hour,
                                          effective_from: selectedOvertimeRate.effective_from,
                                          is_active: selectedOvertimeRate.is_active,
                                      }
                                    : undefined
                            }
                        />
                    </DialogContent>
                </Dialog>

                <DataTable<OvertimeRate>
                    columns={columnOvertimeRates(openEdit)}
                    data={overtimeRates.data}
                    meta={overtimeRates.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
