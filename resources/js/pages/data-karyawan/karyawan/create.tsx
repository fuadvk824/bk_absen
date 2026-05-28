import { Head, useForm, Link } from '@inertiajs/react';
import type React from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Office } from '@/types/type-table/office';
import { toast } from 'sonner';

interface Position {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Props {
    offices: Office[];
    positions: Position[];
    departments: Department[];
}

export default function Create({ offices, positions, departments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        jenis_kelamin: '',
        nik: '',
        tanggal_lahir: '',
        alamat: '',
        no_telepon: '',

        position_id: '',
        department_id: '',
        tanggal_awal_kerja: '',
        kontrak_mulai_tanggal: '',
        kontrak_selesai_tanggal: '',
        office_id: '',

        daily_salary: '',
    });

    const isValid = data.name.trim() !== '' && data.email.trim() !== '';

    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('employee.store'), {
            preserveScroll: true,
            onSuccess: handleToast,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Karyawan', href: route('employee.index') },
                { title: 'Tambah', href: route('employee.create') },
            ]}
        >
            <Head title="Tambah Karyawan" />

            <form onSubmit={submit} className="max-w-4xl space-y-6 rounded bg-white p-6 shadow">
                <h1 className="text-xl font-semibold">Tambah Karyawan - ui belum selesai di perbaiki</h1>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Nama *</Label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <Label>Email *</Label>
                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <Label>Jenis Kelamin</Label>
                        <Select onValueChange={(v) => setData('jenis_kelamin', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.jenis_kelamin && <p className="text-sm text-red-500">{errors.jenis_kelamin}</p>}
                    </div>

                    <div>
                        <Label>NIK</Label>
                        <Input value={data.nik} onChange={(e) => setData('nik', e.target.value)} />
                        {errors.nik && <p className="text-sm text-red-500">{errors.nik}</p>}
                    </div>

                    <div>
                        <Label>Tanggal Lahir</Label>
                        <Input
                            type="date"
                            value={data.tanggal_lahir}
                            onChange={(e) => setData('tanggal_lahir', e.target.value)}
                        />
                        {errors.tanggal_lahir && <p className="text-sm text-red-500">{errors.tanggal_lahir}</p>}
                    </div>

                    <div>
                        <Label>No. Telepon</Label>
                        <Input value={data.no_telepon} onChange={(e) => setData('no_telepon', e.target.value)} />
                        {errors.no_telepon && <p className="text-sm text-red-500">{errors.no_telepon}</p>}
                    </div>

                    <div className="col-span-2">
                        <Label>Alamat</Label>
                        <Input value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                        {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
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

                    <div>
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

                    <div>
                        <Label>Gaji Harian</Label>

                        <Input
                            type="number"
                            placeholder="Contoh: 100000"
                            value={data.daily_salary}
                            onChange={(e) => setData('daily_salary', e.target.value)}
                        />

                        {errors.daily_salary && <p className="text-sm text-red-500">{errors.daily_salary}</p>}
                    </div>

                    <div>
                        <Label>Mulai Kerja</Label>
                        <Input
                            type="date"
                            value={data.tanggal_awal_kerja}
                            onChange={(e) => setData('tanggal_awal_kerja', e.target.value)}
                        />
                        {errors.tanggal_awal_kerja && <p className="text-sm text-red-500">{errors.tanggal_awal_kerja}</p>}
                    </div>

                    <div>
                        <Label>Kontrak Mulai</Label>
                        <Input
                            type="date"
                            value={data.kontrak_mulai_tanggal}
                            onChange={(e) => setData('kontrak_mulai_tanggal', e.target.value)}
                        />
                        {errors.kontrak_mulai_tanggal && (
                            <p className="text-sm text-red-500">{errors.kontrak_mulai_tanggal}</p>
                        )}
                    </div>

                    <div>
                        <Label>Kontrak Selesai</Label>
                        <Input
                            type="date"
                            value={data.kontrak_selesai_tanggal}
                            onChange={(e) => setData('kontrak_selesai_tanggal', e.target.value)}
                        />
                        {errors.kontrak_selesai_tanggal && (
                            <p className="text-sm text-red-500">{errors.kontrak_selesai_tanggal}</p>
                        )}
                    </div>

                    <div>
                        <Label>Kantor Cabang</Label>
                        <Select value={data.office_id} onValueChange={(v) => setData('office_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Office" />
                            </SelectTrigger>
                            <SelectContent>
                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={office.id.toString()}>
                                        {office.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.office_id && <p className="text-sm text-red-500">{errors.office_id}</p>}
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button type="submit" disabled={processing || !isValid}>
                        Simpan
                    </Button>

                    <Link href={route('employee.index')}>
                        <Button variant="outline">Batal</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
