import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { PaginationMeta } from '@/types/pagination';
import type { EasterEggView } from '@/types/type-table/easter-egg-view';

import { useTableActions } from '@/lib/useTableAction';
import { columnEasterEggViews } from './column-eastereggview';

interface Props {
    views: {
        data: EasterEggView[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        perPage?: number;
    };
}

export default function Index({ views, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isRefreshing, setIsRefreshing] = useState(false);

    const allColumns = ['user_id', 'user_name', 'viewed_at', 'app_version', 'platform'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'easter-egg-view.index',
        exportRoute: 'easter-egg-view.export',
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
            route('easter-egg-view.index'),
            {},
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
                    title: 'Easter Egg Views',
                    href: route('easter-egg-view.index'),
                },
            ]}
        >
            <Head title="Easter Egg Views" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">
                        <span className="hidden sm:inline">Data </span>
                        Easter Egg Views
                    </h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="cursor-pointer"
                            disabled={isRefreshing}
                        >
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
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Cari Data</Label>

                        <Input
                            placeholder="Nama pengguna, versi, platform..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>
                </div>

                <DataTable<EasterEggView>
                    columns={columnEasterEggViews}
                    data={views.data}
                    meta={views.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
