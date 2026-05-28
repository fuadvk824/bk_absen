import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { useState } from 'react';

import type { VisibilityState } from '@tanstack/react-table';

import AppLayout from '@/layouts/app-layout';

import { DataTable } from '@/components/table/datatable';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { DollarSign, FileSpreadsheet, RefreshCw } from 'lucide-react';

import type { PaginationMeta } from '@/types/pagination';

import { useTableActions } from '@/lib/useTableAction';
import { Payroll } from '@/types/payroll/payrollList';
import { columnPayrolls } from './column-payroll';
import GeneratePayrollDialog from './generate-payroll-dialog';
import PayrollDetailDialog from './payroll-detail-dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
    id: number;
    name: string;
}

interface Props {
    payrolls: {
        data: Payroll[];
        meta: PaginationMeta;
    };

    filters: {
        search?: string;
        month?: number;
        year?: number;
        status?: string;
        office_id?: number;
        perPage?: number;
    };
    offices: Option[];
}

export default function Index({ payrolls, filters, offices }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const months = [
        { value: 1, label: '26 Des - 25 Jan (bulan 1)' },
        { value: 2, label: '26 Jan - 25 Feb (bulan 2)' },
        { value: 3, label: '26 Feb - 25 Mar (bulan 3)' },
        { value: 4, label: '26 Mar - 25 Apr (bulan 4)' },
        { value: 5, label: '26 Apr - 25 Mei (bulan 5)' },
        { value: 6, label: '26 Mei - 25 Jun (bulan 6)' },
        { value: 7, label: '26 Jun - 25 Jul (bulan 7)' },
        { value: 8, label: '26 Jul - 25 Ags (bulan 8)' },
        { value: 9, label: '26 Ags - 25 Sep (bulan 9)' },
        { value: 10, label: '26 Sep - 25 Okt (bulan 10)' },
        { value: 11, label: '26 Okt - 25 Nov (bulan 11)' },
        { value: 12, label: '26 Nov - 25 Des (bulan 12)' },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 2 + i);

    const allColumns = ['employee', 'month', 'year', 'basic_salary', 'total_additions', 'total_deductions', 'net_salary'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        month: filters.month ?? '',
        year: filters.year ?? '',
        status: filters.status ?? '',
        office_id: filters.office_id ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'payroll.index',
        exportRoute: 'payroll.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            month: '',
            year: '',
            status: '',
            office_id: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);
        router.get(route('payroll.index'), {}, { replace: true, onFinish: () => setIsRefreshing(false) });
    };

    const [openGenerate, setOpenGenerate] = useState(false);

    const handleShowDetail = (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        setOpenDetail(true);
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Payroll',
                    href: route('payroll.index'),
                },
            ]}
        >
            <Head title="Payroll" />

            <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Data Payroll</h1>

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
                            <FileSpreadsheet className="h-4 w-4" />
                            Export
                        </Button>

                        <Button className="cursor-pointer text-xs" onClick={() => setOpenGenerate(true)}>
                            <DollarSign className="h-4 w-4" />
                            Generate
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Karyawan</Label>

                        <Input
                            placeholder="Cari nama..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 bg-white p-4 placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Bulan</Label>
                        <Select
                            value={localFilters.month?.toString()}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'month', Number(value))
                            }
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value.toString()}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Tahun</Label>
                        <Select
                            value={localFilters.year?.toString()}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'year', Number(value))
                            }
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
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
                            <SelectTrigger className="h-7 bg-white p-4">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="bayar">Belum dibayarkan</SelectItem>
                                <SelectItem value="lunas">Sudah dibayarkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Kantor</Label>
                        <Select
                            value={localFilters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'office_id', value)}
                        >
                            <SelectTrigger className="h-7 bg-white p-4">
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
                </div>

                <DataTable<Payroll>
                    columns={columnPayrolls(handleShowDetail)}
                    data={payrolls.data}
                    meta={payrolls.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />

                <Dialog open={openGenerate} onOpenChange={setOpenGenerate}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Generate Payroll</DialogTitle>

                            <DialogDescription className="text-xs">
                                Generate payroll semua karyawan berdasarkan periode.
                            </DialogDescription>
                        </DialogHeader>

                        <GeneratePayrollDialog close={() => setOpenGenerate(false)} />
                    </DialogContent>
                </Dialog>
                <PayrollDetailDialog open={openDetail} onOpenChange={setOpenDetail} payroll={selectedPayroll} />
            </div>
        </AppLayout>
    );
}
