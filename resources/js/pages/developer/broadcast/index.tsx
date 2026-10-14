import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type Employee = {
    id: number;
    name: string;
    employee_code: string;
    email: string;
    status: 'new' | 'magang' | 'kontrak';
};

interface Props {
    employees: Employee[];
}

export default function Index({ employees }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { setData, post, processing, errors } = useForm<{
        employee_ids: number[];
    }>({
        employee_ids: [],
    });

    const filteredEmployees = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return employees
            .filter((employee) => {
                const matchesSearch =
                    employee.name.toLowerCase().includes(keyword) ||
                    employee.email.toLowerCase().includes(keyword) ||
                    employee.employee_code.toLowerCase().includes(keyword);

                const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const aSelected = selectedIds.includes(a.id);
                const bSelected = selectedIds.includes(b.id);

                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;

                return 0;
            });
    }, [employees, search, statusFilter, selectedIds]);

    function toggleEmployee(id: number, checked: boolean) {
        const nextIds = checked ? [...new Set([...selectedIds, id])] : selectedIds.filter((selectedId) => selectedId !== id);

        setSelectedIds(nextIds);
        setData('employee_ids', nextIds);
    }

    function toggleFilteredEmployees(checked: boolean) {
        const visibleIds = filteredEmployees.map((employee) => employee.id);

        const nextIds = checked
            ? [...new Set([...selectedIds, ...visibleIds])]
            : selectedIds.filter((id) => !visibleIds.includes(id));

        setSelectedIds(nextIds);
        setData('employee_ids', nextIds);
    }

    function clearSelection() {
        setSelectedIds([]);
        setData('employee_ids', []);
    }

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (selectedIds.length === 0) {
            toast.error('Pilih minimal satu karyawan terlebih dahulu.');
            return;
        }

        const confirmed = window.confirm(`Kirim informasi pembaruan aplikasi ke ${selectedIds.length} akun terpilih?`);

        if (!confirmed) return;

        post(route('employee.broadcast.send'), {
            onSuccess: () => {
                toast.success('Email pembaruan aplikasi berhasil dimasukkan ke antrean!');

                clearSelection();
            },
            onError: (validationErrors) => {
                if (validationErrors.employee_ids) {
                    toast.error(validationErrors.employee_ids);
                } else {
                    toast.error('Gagal memproses pengiriman email. Periksa kembali data Anda.');
                }
            },
        });
    }

    const allFilteredSelected =
        filteredEmployees.length > 0 && filteredEmployees.every((employee) => selectedIds.includes(employee.id));

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Broadcast Email',
                    href: route('employee.broadcast.index'),
                },
            ]}
        >
            <Head title="Broadcast Pembaruan Aplikasi" />

            <div className="max-w-5xl space-y-6 p-5">
                <div>
                    <h1 className="text-xl font-semibold">Broadcast Pembaruan Aplikasi</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Kirim informasi pembaruan aplikasi Bisa Absen kepada karyawan yang dipilih.
                    </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                    <h2 className="font-semibold">Informasi Pengiriman</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Email menggunakan subjek dan template yang telah ditentukan oleh sistem. Informasi versi aplikasi
                        diambil dari data versi terbaru.
                    </p>

                    <div className="mt-3 text-sm">
                        <strong>{selectedIds.length}</strong> akun dipilih
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-4 rounded-xl border p-4">
                        <div>
                            <h2 className="font-semibold">Pilih Penerima</h2>

                            <p className="text-sm text-muted-foreground">
                                Pilih karyawan berstatus new, magang, atau kontrak yang memiliki alamat email.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="search">Cari Karyawan</Label>

                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Nama, email, atau kode..."
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status-filter">Filter Status</Label>

                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="new">New</option>
                                    <option value="magang">Magang</option>
                                    <option value="kontrak">Kontrak</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Checkbox
                                    checked={allFilteredSelected}
                                    onCheckedChange={(checked) => toggleFilteredEmployees(checked === true)}
                                />
                                Pilih semua hasil filter
                            </label>

                            <span className="text-sm font-medium">{selectedIds.length} akun dipilih</span>
                        </div>

                        <div className="max-h-96 space-y-2 overflow-y-auto">
                            {filteredEmployees.map((employee) => {
                                const isSelected = selectedIds.includes(employee.id);

                                return (
                                    <label
                                        key={employee.id}
                                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => toggleEmployee(employee.id, checked === true)}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">{employee.name}</p>

                                            <p className="text-sm break-all text-muted-foreground">{employee.email}</p>

                                            <p className="text-xs text-muted-foreground">
                                                {employee.employee_code}
                                                {' · '}
                                                {employee.status}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}

                            {filteredEmployees.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Tidak ada akun yang sesuai dengan pencarian atau filter.
                                </p>
                            )}
                        </div>

                        {errors.employee_ids && <p className="text-sm text-red-500">{errors.employee_ids}</p>}

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearSelection}
                                disabled={selectedIds.length === 0}
                            >
                                Kosongkan Pilihan
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button type="submit" disabled={processing || selectedIds.length === 0}>
                            {processing ? 'Memproses...' : `Kirim Pembaruan ke ${selectedIds.length} Akun`}
                        </Button>

                        <p className="text-xs text-muted-foreground">Email akan dimasukkan ke antrean pengiriman.</p>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
