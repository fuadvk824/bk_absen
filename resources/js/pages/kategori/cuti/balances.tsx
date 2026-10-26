import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useRef, useState } from 'react';
import type { VisibilityState } from '@tanstack/react-table';
import { RefreshCw, Search, X } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columnBalance, LeaveBalanceList } from './column-balances';
import { PaginationMeta } from '@/types/pagination';
import { DataTable } from '@/components/table/datatable';

type OfficeOption = {
    id: number;
    office_code: string;
    name: string;
};
interface Props {
    leave: {
        id: number;
        leave_code: string;
        leave_name: string;
    };
    balances: {
        data: LeaveBalanceList[];
        meta: PaginationMeta;
    };
    filters: {
        year?: number;
        perPage?: number;
        search?: string;
        office_id: number | null;
    };
    offices: OfficeOption[];
}

export default function LeaveBalancesIndex({ leave, balances, filters, offices }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [localFilters, setLocalFilters] = useState({
        year: filters.year ?? new Date().getFullYear(),
        perPage: filters.perPage ?? 10,
        search: filters.search ?? '',
    });

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isRefreshing = useRef(false);

    const breadcrumbs = [
        {
            title: 'Kategori Cuti',
            href: route('leave.index'),
        },
        {
            title: 'Sisa Cuti Karyawan',
            href: route('leave.balances', { leave: leave.id }),
        },
    ];

    const visitBalances = (nextFilters: { year: number; perPage: number; search: string }) => {
        router.get(route('leave.balances', { leave: leave.id }), nextFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            search: value,
        }));

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        const search = value.trim();

        // Tidak request jika hanya 1–2 karakter.
        // Input kosong diperbolehkan untuk menghapus filter.
        if (search.length > 0 && search.length < 3) {
            return;
        }

        searchTimeout.current = setTimeout(() => {
            visitBalances({
                ...localFilters,
                search,
            });
        }, 500);
    };

    const handleFilterChange = (key: 'year' | 'perPage', value: number) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        const nextFilters = {
            ...localFilters,
            [key]: value,
        };

        setLocalFilters(nextFilters);
        visitBalances(nextFilters);
    };
    const handleOfficeChange = (value: string) => {
        router.get(
            route('leave.balances', { leave: leave.id }),
            {
                year: filters.year,
                perPage: filters.perPage,
                search: filters.search,
                office_id: value === 'all' ? '' : value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleRefresh = () => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        visitBalances({
            ...localFilters,
            search: localFilters.search.trim(),
        });
    };

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sisa Cuti - ${leave.leave_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">Sisa Cuti Karyawan</h1>

                        <p className="text-sm text-muted-foreground">
                            Kategori:{' '}
                            <span className="font-medium text-foreground">
                                {leave.leave_code} - {leave.leave_name}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isRefreshing.current}
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Cari Nama Karyawan</Label>

                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                value={localFilters.search}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                placeholder="Ketik minimal 3 karakter..."
                                className="h-9 pr-9 pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Kantor</Label>

                        <Select
                            value={filters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) => handleOfficeChange(value)}
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Pilih kantor" />
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
                        <Label className="text-[11px]">Tahun Cuti</Label>

                        <Select
                            value={String(localFilters.year)}
                            onValueChange={(value) => handleFilterChange('year', Number(value))}
                        >
                            <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>

                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<LeaveBalanceList>
                    columns={columnBalance}
                    data={balances.data}
                    meta={balances.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange('perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
