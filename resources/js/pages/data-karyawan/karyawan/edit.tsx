import { Head, useForm, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Employee } from '@/types/type-table/employee';
import type { User } from '@/types/user';
import { Mail, MapPin, Phone, SquarePen } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { toast } from 'sonner';

interface Position {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Office {
    id: number;
    name: string;
}

interface Props {
    user: User;
    employee: Employee;
    offices: Office[];
    departments: Department[];
    positions: Position[];
}

export default function Edit({ user, employee, offices, departments, positions }: Props) {
    console.log("ini user: ",user.email);
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        jenis_kelamin: user?.jenis_kelamin ?? '',
        nik: user?.nik ?? '',
        tanggal_lahir: user?.tanggal_lahir ?? '',
        alamat: user?.alamat ?? '',
        no_telepon: user?.no_telepon ?? '',

        office_id: employee.office_id?.toString() ?? '',
        department_id: employee.department_id?.toString() ?? '',
        position_id: employee.position_id?.toString() ?? '',

        daily_salary: employee.daily_salary?.toString() ?? '',
        tanggal_awal_kerja: employee.tanggal_awal_kerja ?? '',
        kontrak_mulai_tanggal: employee.kontrak_mulai_tanggal ?? '',
        kontrak_selesai_tanggal: employee.kontrak_selesai_tanggal ?? '',
    });

    const isValid = data.name.trim() !== '';

    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    };

    const handleUpdate = () => {
        put(route('employee.update', { employee: employee.id }), {
            preserveScroll: true,
            onSuccess: handleToast,
        });
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Employee', href: route('employee.index') },
                {
                    title: 'Edit',
                    href: route('employee.edit', { employee: employee.id }),
                },
            ]}
        >
            <Head title="Edit Employee" />
            <div className="mb-20 space-y-4 p-5">
                <div className="to-white-500 relative h-28 w-full rounded-xl bg-linear-to-br from-slate-700 to-slate-50">
                    <div className="absolute -bottom-11 left-6 flex items-center gap-4">
                        <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200" />
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold">{user.name}</h1>
                            <div className="-mx-3 flex divide-x divide-black/80 *:px-3">
                                <span className="flex items-center gap-1 text-sm opacity-80">
                                    <Mail size={16} className="text-black/80" /> {user.email}
                                </span>
                                <span className="flex items-center gap-1 text-sm opacity-80">
                                    <Phone size={16} className="text-black/80" /> {user.no_telepon}
                                </span>
                                <span className="flex items-center gap-1 text-sm opacity-80">
                                    <MapPin size={16} className="text-black/80" />
                                    {user.alamat}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-s-4 border-gray-500 p-4">
                        <p className="text-sm text-muted-foreground">Jabatan</p>
                        <p className="font-semibold">{positions.find((p) => p.id === employee.position_id)?.name ?? '-'}</p>
                    </div>

                    <div className="rounded-xl border border-s-4 border-gray-500 p-4">
                        <p className="text-sm text-muted-foreground">Departemen</p>
                        <p className="font-semibold">
                            {departments.find((d) => d.id === employee.department_id)?.name ?? '-'}
                        </p>
                    </div>

                    <div className="rounded-xl border border-s-4 border-gray-500 p-4">
                        <p className="text-sm text-muted-foreground">Kantor</p>
                        <p className="font-semibold">{offices.find((o) => o.id === employee.office_id)?.name ?? '-'}</p>
                    </div>
                </div>

                <form className="flex flex-col gap-6 rounded-xl border p-6 text-xs">
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="flex-1 space-y-3">
                            <h2 className="text-sm font-semibold">Informasi Personal</h2>

                            <div className="space-y-1">
                                <Label>Nama</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                               
                            </div>
                            <div className="space-y-1">
                                <Label>Jenis Kelamin</Label>
                                <Select value={data.jenis_kelamin} onValueChange={(v) => setData('jenis_kelamin', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L">Laki-laki</SelectItem>
                                        <SelectItem value="P">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>NIK</Label>
                                <Input value={data.nik} onChange={(e) => setData('nik', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label>Tanggal Lahir</Label>
                                <Input
                                    type="date"
                                    value={data.tanggal_lahir ?? ''}
                                    onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>No Telepon</Label>
                                <Input value={data.no_telepon} onChange={(e) => setData('no_telepon', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label>Alamat</Label>
                                <Input value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <h2 className="text-sm font-semibold">Informasi Pekerjaan</h2>

                            <div className="space-y-1">
                                <Label>Jabatan</Label>
                                <Select value={data.position_id} onValueChange={(v) => setData('position_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Jabatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Departemen</Label>
                                <Select value={data.department_id} onValueChange={(v) => setData('department_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Kantor</Label>
                                <Select value={data.office_id} onValueChange={(v) => setData('office_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Office" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {offices.map((o) => (
                                            <SelectItem key={o.id} value={o.id.toString()}>
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Gaji Harian</Label>

                                <Input
                                    type="number"
                                    value={data.daily_salary}
                                    onChange={(e) => setData('daily_salary', e.target.value)}
                                    placeholder="Contoh: 110000"
                                />

                                {errors.daily_salary && <p className="text-sm text-red-500">{errors.daily_salary}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>Mulai Kerja</Label>
                                <Input
                                    type="date"
                                    className="h-8"
                                    value={data.tanggal_awal_kerja ?? ''}
                                    onChange={(e) => setData('tanggal_awal_kerja', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Kontrak Mulai</Label>
                                <Input
                                    type="date"
                                    value={data.kontrak_mulai_tanggal ?? ''}
                                    onChange={(e) => setData('kontrak_mulai_tanggal', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Kontrak Selesai</Label>
                                <Input
                                    type="date"
                                    value={data.kontrak_selesai_tanggal ?? ''}
                                    onChange={(e) => setData('kontrak_selesai_tanggal', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Link href={route('employee.index')}>
                            <Button size="sm" variant="outline" className="cursor-pointer">
                                Batal
                            </Button>
                        </Link>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={processing || !isValid} className="cursor-pointer">
                                    Update Profile
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia>
                                        <SquarePen />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Update Employee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin ingin mengubah data karyawan ini?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="cursor-pointer" onClick={handleUpdate}>
                                        Update
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}