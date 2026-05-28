import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import type { VisibilityState } from '@tanstack/react-table';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import type { PaginationMeta } from '@/types/pagination';
import { columnOffices } from './column-offices';

import { useTableActions } from '@/lib/useTableAction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfficeList } from '@/types/kantor/officeList';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, HousePlus, RefreshCw } from 'lucide-react';

interface Props {
    offices: {
        data: OfficeList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        city?: string;
        status?: string;
        perPage?: number;
    };
}

export default function Index({ offices, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = ['name', 'phone', 'address', 'city', 'province', 'poscode', 'status'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        city: filters.city ?? undefined,
        status: filters.status ?? undefined,
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'office.index',
        exportRoute: 'office.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            city: '',
            status: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(route('office.index'), {}, { replace: true, onFinish: () => setIsRefreshing(false) });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kantor', href: route('office.index') }]}>
            <Head title="Kantor" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Data Kantor </h1>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => handleExport(columnVisibility)}>
                            <FileSpreadsheet className="h-4 w-4" />
                            Export
                        </Button>
                        <Link href={route('office.create')}>
                            <Button>
                                <HousePlus className="h-4 w-4" />
                                Tambah
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Kantor</Label>
                        <Input
                            placeholder="Cari nama kantor..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 bg-white p-4 placeholder:text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Status</Label>
                        <Select
                            value={localFilters.status ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'status', value)}
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Status Office" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Non Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<OfficeList>
                    columns={columnOffices}
                    data={offices.data}
                    meta={offices.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
