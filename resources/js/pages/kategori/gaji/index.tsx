import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';

import { DataTable } from '@/components/table/datatable';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { BadgeDollarSign, FileSpreadsheet, RefreshCw } from 'lucide-react';

import { PaginationMeta } from '@/types/pagination';
import { SalaryList } from '@/types/kategori-masterdata/salaryList';

import { useTableActions } from '@/lib/useTableAction';

import Form from './form';
import { columnSalary } from './column-salary';

interface Props {
    salaries: {
        data: SalaryList[];
        meta: PaginationMeta;
    };

    employees: {
        id: number;
        name: string;
    }[];

    filters: {
        search?: string;
        perPage?: number;
        min_salary?: number;
        max_salary?: number;
    };
}

export default function Index({ salaries, employees, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const [isRefreshing, setIsRefreshing] = useState(false);

    const allColumns = ['employee_name', 'daily_salary', 'effective_from'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        min_salary: filters.min_salary ?? '',

        max_salary: filters.max_salary ?? '',

        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'salary.index',
        exportRoute: 'salary.export',
        allColumns,
    });

    const handleResetFilters = () => {
        setIsRefreshing(true);

        const defaultFilters = {
            search: '',
            min_salary: '',
            max_salary: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('salary.index'),
            {},
            {
                replace: true,

                onFinish: () => setIsRefreshing(false),
            },
        );
    };


    const [open, setOpen] = useState(false);

    const [selectedSalary, setSelectedSalary] = useState<SalaryList | null>(null);

    const openCreate = () => {
        setSelectedSalary(null);
        setOpen(true);
    };

    const openEdit = (salary: SalaryList) => {
        setSelectedSalary(salary);
        setOpen(true);
    };


    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Salary',
                    href: route('salary.index'),
                },
            ]}
        >
            <Head title="Salary" />

            <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Data Salary</h1>

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

                        <Button className="cursor-pointer text-xs" onClick={openCreate}>
                            <BadgeDollarSign className="h-4 w-4" />
                            Tambah
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Karyawan</Label>

                        <Input
                            placeholder="Cari nama karyawan..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-8 bg-white placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Min Daily Salary</Label>

                        <Input
                            type="number"
                            placeholder="0"
                            value={localFilters.min_salary}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'min_salary', e.target.value)}
                            className="h-8 [appearance:textfield] bg-white placeholder:text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Max Daily Salary</Label>

                        <Input
                            type="number"
                            placeholder="0"
                            value={localFilters.max_salary}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'max_salary', e.target.value)}
                            className="h-8 [appearance:textfield] bg-white placeholder:text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedSalary ? 'Edit Salary' : 'Tambah Salary'}</DialogTitle>

                            <DialogDescription>
                                {selectedSalary
                                    ? 'Perbarui data salary karyawan dan simpan perubahan.'
                                    : 'Tambahkan data salary baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            employees={employees}
                            close={() => setOpen(false)}
                            initialData={
                                selectedSalary
                                    ? {
                                          id: selectedSalary.id,

                                          employee_id: selectedSalary.employee_id,

                                          daily_salary: selectedSalary.daily_salary,

                                          effective_from: selectedSalary.effective_from,
                                      }
                                    : undefined
                            }
                        />
                    </DialogContent>
                </Dialog>

                <DataTable<SalaryList>
                    columns={columnSalary(openEdit)}
                    data={salaries.data}
                    meta={salaries.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
