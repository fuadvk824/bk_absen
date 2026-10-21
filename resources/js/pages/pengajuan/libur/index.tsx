import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCheck, X } from 'lucide-react';

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
} from '@/components/ui/alert-dialog';

import AppLayout from '@/layouts/app-layout';
import type { PaginationMeta } from '@/types/pagination';
import { useTableActions } from '@/lib/useTableAction';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

import type { OffdayFilters, OffdayList } from '@/types/pengajuan/offdaylist';
import { columnOffday } from './column-offday';

interface FilterOption {
    id: number;
    name: string;
}

interface Props {
    requests: {
        data: OffdayList[];
        meta: PaginationMeta;
    };
    filters: OffdayFilters;
    periodLabel: string;
    positions: FilterOption[];
    departments: FilterOption[];
    offices: FilterOption[];
}

const months = [
    { value: 1, label: '26 Jan - 25 Feb' },
    { value: 2, label: '26 Feb - 25 Mar' },
    { value: 3, label: '26 Mar - 25 Apr' },
    { value: 4, label: '26 Apr - 25 Mei' },
    { value: 5, label: '26 Mei - 25 Jun' },
    { value: 6, label: '26 Jun - 25 Jul' },
    { value: 7, label: '26 Jul - 25 Ags' },
    { value: 8, label: '26 Ags - 25 Sep' },
    { value: 9, label: '26 Sep - 25 Okt' },
    { value: 10, label: '26 Okt - 25 Nov' },
    { value: 11, label: '26 Nov - 25 Des' },
    { value: 12, label: '26 Des - 25 Jan' },
];

type BulkStatus = 'approved' | 'rejected';

export default function Index({ requests, filters, periodLabel, positions, departments, offices }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const [bulkStatus, setBulkStatus] = useState<BulkStatus | null>(null);

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
        office_id: filters.office_id ? String(filters.office_id) : 'all',
        department_id: filters.department_id ? String(filters.department_id) : 'all',
        position_id: filters.position_id ? String(filters.position_id) : 'all',
        month: Number(filters.month),
        year: Number(filters.year),
        perPage: Number(filters.perPage ?? 10),
    });

    const allColumns = ['employee_name', 'team_name', 'request_dates', 'status'];

    const { handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'offday.index',
        exportRoute: 'offday.export',
        allColumns,
    });

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 20 }, (_, index) => currentYear - 2 + index);

    const getRowKey = (item: OffdayList) => `${item.employee_id}-${item.period_start}`;

    const pendingRows = useMemo(() => requests.data.filter((item) => item.status === 'pending'), [requests.data]);

    const visiblePendingKeys = pendingRows.map(getRowKey);

    const allSelected = visiblePendingKeys.length > 0 && visiblePendingKeys.every((key) => selectedKeys.has(key));

    const someSelected = visiblePendingKeys.some((key) => selectedKeys.has(key)) && !allSelected;

    const selectedGroups = pendingRows.filter((item) => selectedKeys.has(getRowKey(item)));

    useEffect(() => {
        setSelectedKeys(new Set());
    }, [requests.data]);

    const toggleSelection = (key: string, checked: boolean) => {
        setSelectedKeys((previous) => {
            const next = new Set(previous);

            if (checked) {
                next.add(key);
            } else {
                next.delete(key);
            }

            return next;
        });
    };

    const toggleAllSelection = (checked: boolean) => {
        setSelectedKeys((previous) => {
            const next = new Set(previous);

            visiblePendingKeys.forEach((key) => {
                if (checked) {
                    next.add(key);
                } else {
                    next.delete(key);
                }
            });

            return next;
        });
    };

    const columns = useMemo(
        () =>
            columnOffday({
                selectedKeys,
                onToggle: toggleSelection,
                onToggleAll: toggleAllSelection,
                allSelected,
                someSelected,
            }),
        [selectedKeys, allSelected, someSelected],
    );

    const applyFilters = (changes: Partial<typeof localFilters>) => {
        const nextFilters = {
            ...localFilters,
            ...changes,
        };

        setLocalFilters(nextFilters);
        setSelectedKeys(new Set());

        router.get(
            route('offday.index'),
            {
                search: nextFilters.search || '',
                status: nextFilters.status || '',
                office_id: nextFilters.office_id === 'all' ? '' : nextFilters.office_id,
                department_id: nextFilters.department_id === 'all' ? '' : nextFilters.department_id,
                position_id: nextFilters.position_id === 'all' ? '' : nextFilters.position_id,
                month: nextFilters.month,
                year: nextFilters.year,
                perPage: nextFilters.perPage,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleResetFilters = () => {
        setIsRefreshing(true);
        setSelectedKeys(new Set());

        const today = new Date();

       
        const defaultPeriodDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (defaultPeriodDate.getDate() < 26) {
            defaultPeriodDate.setMonth(defaultPeriodDate.getMonth() - 1);
        }

        const defaultFilters = {
            search: '',
            status: '',
            office_id: 'all',
            department_id: 'all',
            position_id: 'all',
            month: defaultPeriodDate.getMonth() + 1,
            year: defaultPeriodDate.getFullYear(),
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('offday.index'),
            {},
            {
                replace: true,
                preserveState: false,
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            },
        );
    };

    const handleBulkStatus = (status: BulkStatus) => {
        if (selectedGroups.length === 0) {
            toast.error('Pilih minimal satu pengajuan pending.');
            return;
        }

        setIsBulkProcessing(true);

        router.patch(
            route('offday.updateBulkGroupStatus'),
            {
                groups: selectedGroups.map((item) => ({
                    employee_id: item.employee_id,
                    period_start: item.period_start,
                    current_status: item.status,
                })),
                status,
            },
            {
                preserveScroll: true,

                onSuccess: (page) => {
                    const flash = page.props.flash as {
                        success?: string;
                        error?: string;
                        info?: string;
                    };

                    if (flash?.success) {
                        toast.success(flash.success);
                    }

                    if (flash?.error) {
                        toast.error(flash.error);
                    }

                    if (flash?.info) {
                        toast.info(flash.info);
                    }

                    setSelectedKeys(new Set());
                    setBulkStatus(null);
                },

                onError: (errors) => {
                    toast.error(String(Object.values(errors)[0] ?? 'Terjadi kesalahan saat memproses pengajuan.'));
                },

                onFinish: () => {
                    setIsBulkProcessing(false);
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Pengajuan Libur',
                    href: route('offday.index'),
                },
            ]}
        >
            <Head title="Pengajuan Libur" />

            <div className="space-y-4 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-lg font-semibold sm:text-xl">Pengajuan Libur</h1>

                        <span className="text-xs text-muted-foreground sm:text-sm">Periode: {periodLabel}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            disabled={selectedGroups.length === 0 || isBulkProcessing}
                            onClick={() => setBulkStatus('approved')}
                            className="cursor-pointer text-green-600"
                        >
                            <CheckCheck className="h-4 w-4" />

                            <span>Approve ({selectedGroups.length})</span>
                        </Button>

                        <Button
                            variant="outline"
                            disabled={selectedGroups.length === 0 || isBulkProcessing}
                            onClick={() => setBulkStatus('rejected')}
                            className="cursor-pointer text-red-600"
                        >
                            <X className="h-4 w-4" />

                            <span>Reject ({selectedGroups.length})</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            disabled={isRefreshing}
                            className="cursor-pointer"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />

                            <span className="hidden sm:block">Refresh</span>
                        </Button>

                        <Button variant="outline" onClick={() => handleExport(columnVisibility)} className="cursor-pointer">
                            <FileSpreadsheet className="h-4 w-4" />

                            <span className="hidden sm:block">Export</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Nama Karyawan</Label>

                        <Input
                            placeholder="Cari nama karyawan..."
                            value={localFilters.search}
                            onChange={(event) =>
                                applyFilters({
                                    search: event.target.value,
                                })
                            }
                            className="h-9 placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[11px]">Periode</Label>

                        <Select
                            value={String(localFilters.month)}
                            onValueChange={(value) =>
                                applyFilters({
                                    month: Number(value),
                                })
                            }
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Pilih periode" />
                            </SelectTrigger>

                            <SelectContent>
                                {months.map((item) => (
                                    <SelectItem key={item.value} value={String(item.value)}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[11px]">Tahun Periode</Label>

                        <Select
                            value={String(localFilters.year)}
                            onValueChange={(value) =>
                                applyFilters({
                                    year: Number(value),
                                })
                            }
                        >
                            <SelectTrigger className="h-9">
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
                    
                    <div className="space-y-1">
                        <Label className="text-[11px]">Status Pengajuan</Label>

                        <Select
                            value={localFilters.status || 'all'}
                            onValueChange={(value) =>
                                applyFilters({
                                    status: value === 'all' ? '' : value,
                                })
                            }
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>

                                <SelectItem value="pending">Pending</SelectItem>

                                <SelectItem value="approved">Disetujui</SelectItem>

                                <SelectItem value="rejected">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[11px]">Position</Label>

                        <Select
                            value={localFilters.position_id}
                            onValueChange={(value) =>
                                applyFilters({
                                    position_id: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Position" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Position</SelectItem>

                                {positions.map((position) => (
                                    <SelectItem key={position.id} value={String(position.id)}>
                                        {position.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[11px]">Department</Label>

                        <Select
                            value={localFilters.department_id}
                            onValueChange={(value) =>
                                applyFilters({
                                    department_id: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Department" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua Department</SelectItem>

                                {departments.map((department) => (
                                    <SelectItem key={department.id} value={String(department.id)}>
                                        {department.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[11px]">Office</Label>

                        <Select
                            value={localFilters.office_id}
                            onValueChange={(value) =>
                                applyFilters({
                                    office_id: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Office" />
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

                </div>

                <DataTable<OffdayList>
                    columns={columns}
                    data={requests.data}
                    meta={requests.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) =>
                        applyFilters({
                            perPage: Number(value),
                        })
                    }
                />

                <AlertDialog
                    open={bulkStatus !== null}
                    onOpenChange={(open) => {
                        if (!open && !isBulkProcessing) {
                            setBulkStatus(null);
                        }
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {bulkStatus === 'approved' ? 'Approve Pengajuan Terpilih' : 'Reject Pengajuan Terpilih'}
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                Apakah kamu yakin ingin {bulkStatus === 'approved' ? 'menyetujui' : 'menolak'} seluruh
                                pengajuan dari <strong>{selectedGroups.length} karyawan</strong> yang dipilih? Semua
                                pengajuan pending dalam periode masing-masing akan diproses.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isBulkProcessing} className="cursor-pointer">
                                Batal
                            </AlertDialogCancel>

                            <AlertDialogAction
                                disabled={isBulkProcessing || selectedGroups.length === 0}
                                className={
                                    bulkStatus === 'approved'
                                        ? 'cursor-pointer bg-green-600 text-white hover:bg-green-700'
                                        : 'cursor-pointer bg-red-600 text-white hover:bg-red-700'
                                }
                                onClick={(event) => {
                                    event.preventDefault();

                                    if (bulkStatus) {
                                        handleBulkStatus(bulkStatus);
                                    }
                                }}
                            >
                                {isBulkProcessing
                                    ? 'Memproses...'
                                    : bulkStatus === 'approved'
                                      ? 'Ya, Approve Semua'
                                      : 'Ya, Reject Semua'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
