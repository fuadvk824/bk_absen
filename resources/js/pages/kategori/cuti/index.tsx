import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import { useTableActions } from '@/lib/useTableAction';
import { Label } from '@/components/ui/label';
import { BriefcaseConveyorBelt, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { LeaveList } from '@/types/kategori-masterdata/leaveList';
import { columnLeaves } from './column-leave';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import Form from './form';

interface Props {
    leaves: {
        data: LeaveList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        perPage?: number;
    };
}

export default function Index({ leaves, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
 const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['leave_code', 'leave_name', 'max_days', 'masa_bakti', 'reset'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'leave.index',
        exportRoute: 'leave.export',
        allColumns,
    });

    const [open, setOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveList | null>(null);

    const openCreate = () => {
        setSelectedLeave(null);
        setOpen(true);
    };

    const openEdit = (leave: LeaveList) => {
        setSelectedLeave(leave);
        setOpen(true);
    };

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(route('leave.index'), {}, { replace: true,  onFinish: () => setIsRefreshing(false), });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kategori Cuti', href: route('leave.index') }]}>
            <Head title="Kategori Cuti" />

            <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Kategori Cuti</h1>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                             <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport(columnVisibility)}
                            className="cursor-pointer text-xs"
                        >
                            <FileSpreadsheet className="h-4 w-4" />Export
                        </Button>

                        <Button className="cursor-pointer text-xs" onClick={openCreate}>
                            <BriefcaseConveyorBelt className="h-4 w-4" />Tambah
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Kategori Cuti</Label>
                        <Input
                            placeholder="Cari kategori cuti..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedLeave ? 'Edit Kategori Cuti' : 'Tambah Kategori Cuti'}</DialogTitle>

                            <DialogDescription>
                                {selectedLeave
                                    ? 'Perbarui kategori cuti yang dipilih dan simpan perubahan.'
                                    : 'Tambahkan kategori cuti baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            close={() => setOpen(false)}
                            initialData={
                                selectedLeave
                                    ? {
                                          id: selectedLeave.id,
                                          leave_name: selectedLeave.leave_name,
                                          max_days: selectedLeave.max_days,
                                          masa_bakti: selectedLeave.masa_bakti,
                                          reset: selectedLeave.reset,
                                      }
                                    : undefined
                            }
                        />
                    </DialogContent>
                </Dialog>

                <DataTable<LeaveList>
                    columns={columnLeaves(openEdit)}
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
