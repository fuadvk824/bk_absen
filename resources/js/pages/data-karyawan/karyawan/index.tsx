import { Head, Link, router } from '@inertiajs/react';
import type { VisibilityState } from '@tanstack/react-table';
import { useState } from 'react';

import { route } from 'ziggy-js';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { EmployeeList } from '@/types/data-karyawan/employeelist';
import type { PaginationMeta } from '@/types/pagination';
import { columnEmployees } from './column-employees';

import { useTableActions } from '@/lib/useTableAction';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Plus, RefreshCw, UserPlus } from 'lucide-react';

interface Option {
    id: number;
    name: string;
}

interface Props {
    employees: {
        data: EmployeeList[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        position_id?: number;
        department_id?: number;
        office_id?: number;
        status?: string;
        perPage?: number;
    };
    positions: Option[];
    departments: Option[];
    offices: Option[];
}

export default function Index({ employees, filters, positions, departments, offices }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const allColumns = [
        'id',
        'employee_code',
        'nama_karyawan',
        'jabatan',
        'tanggal_awal_kerja',
        'no_telepon',
        'tanggal_lahir',
        'alamat',
        'status',
        'name_shift',
    ];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        office_id: filters.office_id ?? undefined,
        department_id: filters.department_id ?? undefined,
        position_id: filters.position_id ?? undefined,
        status: filters.status,
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange, handleExport } = useTableActions({
        filters: localFilters,
        indexRoute: 'employee.index',
        exportRoute: 'employee.export',
        allColumns,
    });

    const handleResetFilters = () => {
          setIsRefreshing(true);
        const defaultFilters = {
            search: '',
            office_id: undefined,
            department_id: undefined,
            position_id: undefined,
            status: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(route('employee.index'), {},   {
                replace: true,
                onFinish: () => setIsRefreshing(false),
            },);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Karyawan', href: route('employee.index') }]}>
            <Head title="Data Karyawan" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Data Karyawan</h1>

                    <div className="flex gap-2">
                        <Button variant="outline"  onClick={handleResetFilters} className="cursor-pointer">
                             <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport(columnVisibility)}
                            
                        >
                            <FileSpreadsheet className="h-4 w-4" />Export
                        </Button>

                        <Link href={route('employee.create')}>
                            <Button >
                                <UserPlus className="h-4 w-4" />Tambah
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label>Nama Karyawan</Label>
                        <Input
                            placeholder="Cari nama karyawan..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 bg-white p-4 placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Jabatan</Label>
                        <Select
                            value={localFilters.position_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'position_id', value)
                            }
                        >
                            <SelectTrigger className="h-7 bg-white p-4  ">
                                <SelectValue placeholder="Pilih Jabatan" />
                            </SelectTrigger>
                            <SelectContent  >
                                <SelectItem value="all"  >
                                    Semua Jabatan
                                </SelectItem>
                                {positions.map((pos) => (
                                    <SelectItem key={pos.id} value={pos.id.toString()}  >
                                        {pos.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Departemen</Label>
                        <Select
                            value={localFilters.department_id?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(localFilters, setLocalFilters, 'department_id', value)
                            }
                        >
                            <SelectTrigger className="h-7 bg-white p-4  ">
                                <SelectValue placeholder="Pilih departemen" />
                            </SelectTrigger>
                            <SelectContent >
                                <SelectItem   value="all">
                                    Semua Departemen
                                </SelectItem>
                                {departments.map((dep) => (
                                    <SelectItem key={dep.id} value={dep.id.toString()}  >
                                        {dep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Kantor</Label>
                        <Select
                            value={localFilters.office_id?.toString() ?? 'all'}
                            onValueChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'office_id', value)}
                        >
                            <SelectTrigger className="h-7 bg-white p-4   ">
                                <SelectValue placeholder="Pilih kantor" />
                            </SelectTrigger>
                            <SelectContent  >
                                <SelectItem  value="all">
                                    Semua Kantor
                                </SelectItem>
                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={office.id.toString()} >
                                        {office.name}
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
                            <SelectTrigger className="h-7 bg-white p-4 ">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent >
                                <SelectItem value="all" >
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="new" >
                                    New
                                </SelectItem>
                                <SelectItem value="magang" >
                                    Magang/Training
                                </SelectItem>
                                <SelectItem value="kontrak" >
                                    Kontrak
                                </SelectItem>
                                <SelectItem value="inactive" >
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable<EmployeeList>
                    columns={columnEmployees}
                    data={employees.data}
                    meta={employees.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
