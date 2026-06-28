import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import type { Position } from '@/types/type-table/position';
import { useTableActions } from '@/lib/useTableAction';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, RefreshCw, UserCog } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Form from './form';
import { columnPositions } from './column-position';

interface Props {
    positions: {
        data: Position[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        perPage?: number;
    };
}

export default function Index({ positions, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['position_code', 'name'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'position.index',
        exportRoute: 'position.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(route('position.index'), {}, { replace: true, onFinish: () => setIsRefreshing(false) });
    };

    const [open, setOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Position | null>(null);

    const openCreate = () => {
        setSelectedLeave(null);
        setOpen(true);
    };

    const openEdit = (leave: Position) => {
        setSelectedLeave(leave);
        setOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Jabatan', href: route('position.index') }]}>
            <Head title="Jabatan" />

            <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">
                        <span className="hidden sm:inline">Data</span> Jabatan
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

                        <Button className="cursor-pointer text-xs" onClick={openCreate}>
                            <UserCog className="h-4 w-4" />
                            <span className="hidden sm:block">Tambah</span>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Nama Karyawan</Label>
                        <Input
                            placeholder="Cari posisi jabatan..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedLeave ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>

                            <DialogDescription>
                                {selectedLeave
                                    ? 'Perbarui nama jabatan yang dipilih dan simpan perubahan.'
                                    : 'Tambahkan jabatan baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            close={() => setOpen(false)}
                            initialData={
                                selectedLeave
                                    ? {
                                          id: selectedLeave.id,
                                          name: selectedLeave.name,
                                      }
                                    : undefined
                            }
                        />
                    </DialogContent>
                </Dialog>

                <DataTable<Position>
                    columns={columnPositions(openEdit)}
                    data={positions.data}
                    meta={positions.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
