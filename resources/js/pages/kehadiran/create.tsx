import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import { route } from 'ziggy-js';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import AttendanceLocationPicker from './attendance-location-picker';
import { useMemo, useState } from 'react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Office {
    id: number;
    name: string;
    latitude: number | string | null;
    longitude: number | string | null;
    radius_meter: number | string | null;
}

interface Shift {
    id: number;
    name_shift: string;
    toleransi_late: number;
}

interface Employee {
    id: number;
    employee_code: string;
    name: string;
    office: Office | null;
    shift: Shift | null;
}

interface Props {
    employees: Employee[];
}

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCurrentTime() {
    const date = new Date();

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function CreateAttendance({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        tanggal: getToday(),
        check_in: getCurrentTime(),
        latitude_checkin: null as number | null,
        longitude_checkin: null as number | null,
    });

    const selectedEmployee = useMemo(
        () => employees.find((employee) => String(employee.id) === data.employee_id),
        [employees, data.employee_id],
    );

    const office = selectedEmployee?.office ?? null;

    const [employeeSearch, setEmployeeSearch] = useState('');
    const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

    const filteredEmployees = useMemo(() => {
        const keyword = employeeSearch.trim().toLowerCase();

        if (!keyword) return employees;

        return employees.filter(
            (employee) =>
                employee.name.toLowerCase().includes(keyword) || employee.employee_code.toLowerCase().includes(keyword),
        );
    }, [employees, employeeSearch]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post(route('attendance.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Kehadiran',
                    href: route('attendance.index'),
                },
                {
                    title: 'Tambah Check-in',
                    href: route('attendance.create'),
                },
            ]}
        >
            <Head title="Tambah Attendance" />

            <div className="space-y-5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Tambah Attendance</h1>

                        <p className="mt-1 text-sm text-muted-foreground">Buat data kehadiran karyawan tertentu</p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('attendance.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="employee-search">Nama Karyawan</Label>

                            <Popover open={employeeDropdownOpen} onOpenChange={setEmployeeDropdownOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={employeeDropdownOpen}
                                        className="w-full justify-between font-normal"
                                    >
                                        <span className="truncate">
                                            {selectedEmployee
                                                ? `${selectedEmployee.name} (${selectedEmployee.employee_code})`
                                                : 'Cari dan pilih karyawan...'}
                                        </span>

                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <div className="flex items-center border-b px-3">
                                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />

                                        <Input
                                            id="employee-search"
                                            value={employeeSearch}
                                            onChange={(event) => setEmployeeSearch(event.target.value)}
                                            placeholder="Cari nama atau kode karyawan..."
                                            className="border-0 shadow-none focus-visible:ring-0"
                                        />
                                    </div>

                                    <div className="max-h-64 overflow-y-auto p-1">
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setData({
                                                            ...data,
                                                            employee_id: String(employee.id),
                                                            latitude_checkin: null,
                                                            longitude_checkin: null,
                                                        });

                                                        setEmployeeSearch('');
                                                        setEmployeeDropdownOpen(false);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-medium">{employee.name}</span>

                                                        <span className="block truncate text-xs text-muted-foreground">
                                                            {employee.employee_code}
                                                            {' · '}
                                                            {employee.office?.name ?? 'Belum ada kantor'}
                                                        </span>
                                                    </span>

                                                    {String(data.employee_id) === String(employee.id) && (
                                                        <Check className="ml-2 h-4 w-4 shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                                Karyawan tidak ditemukan.
                                            </p>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Kantor</Label>

                            <Input readOnly value={office?.name ?? 'Pilih karyawan terlebih dahulu'} />

                            {office && (
                                <p className="text-xs text-muted-foreground">
                                    Radius kantor: {office.radius_meter ?? 0} meter
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Tanggal *</Label>

                            <Input
                                type="date"
                                value={data.tanggal}
                                onChange={(event) => setData('tanggal', event.target.value)}
                                required
                            />

                            {errors.tanggal && <p className="text-sm text-red-600">{errors.tanggal}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Waktu Check-in *</Label>

                            <Input
                                type="time"
                                value={data.check_in}
                                onChange={(event) => setData('check_in', event.target.value)}
                                required
                            />

                            {errors.check_in && <p className="text-sm text-red-600">{errors.check_in}</p>}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border p-4">
                        <div>
                            <h2 className="flex items-center gap-2 font-semibold">
                                <MapPin className="h-5 w-5" />
                                Lokasi Check-in
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Pilih titik check-in pada peta di sekitar kantor karyawan.
                            </p>
                        </div>

                        {office ? (
                            <AttendanceLocationPicker
                                key={selectedEmployee?.id}
                                office={office}
                                latitude={data.latitude_checkin}
                                longitude={data.longitude_checkin}
                               
                                onSelect={(latitude, longitude) => {
                                    setData({
                                        ...data,
                                        latitude_checkin: latitude,
                                        longitude_checkin: longitude,
                                    });
                                }}
                            />
                        ) : (
                            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                                Pilih karyawan untuk menampilkan peta kantor.
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Latitude Check-in *</Label>

                                <Input readOnly value={data.latitude_checkin ?? ''} placeholder="Klik titik pada peta" />

                                {errors.latitude_checkin && (
                                    <p className="text-sm text-red-600">{errors.latitude_checkin}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Longitude Check-in *</Label>

                                <Input readOnly value={data.longitude_checkin ?? ''} placeholder="Klik titik pada peta" />

                                {errors.longitude_checkin && (
                                    <p className="text-sm text-red-600">{errors.longitude_checkin}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" asChild>
                            <Link href={route('attendance.index')}>Batal</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.employee_id ||
                                !data.tanggal ||
                                !data.check_in ||
                                data.latitude_checkin === null ||
                                data.longitude_checkin === null ||
                                !office
                            }
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
