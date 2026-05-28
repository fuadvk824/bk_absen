import { Link } from '@inertiajs/react';
import type React from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Office } from '@/types/type-table/office';

type Props = {
    data: Office;
    existingImage?: string | null;
    setData: <K extends keyof Office>(key: K, value: Office[K]) => void;
    errors: Partial<Record<keyof Office, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitLabel?: string;
};

export default function OfficeForm({ data,existingImage, setData, errors, processing, onSubmit, submitLabel }: Props) {
    const isValid = data.name.trim() !== '';

    return (
        <form onSubmit={onSubmit} className="w-full space-y-6 rounded bg-white p-6 shadow">
            <h1 className="text-xl font-semibold">{submitLabel} Kantor - ui belum selesai di perbaiki</h1>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label>Image</Label>

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setData('image', e.target.files[0]);
                            }
                        }}
                    />

                    {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}

                    {data.image && typeof data.image !== 'string' ? (
                        <img
                            src={URL.createObjectURL(data.image)}
                            alt="Preview"
                            className="mt-3 h-40 w-40 rounded border object-cover"
                        />
                    ) : existingImage ? (
                        <img src={existingImage} alt="Current" className="mt-3 h-40 w-40 rounded border object-cover" />
                    ) : null}
                </div>

                <div>
                    <Label>Nama *</Label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <Label>No Telepon</Label>
                    <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                </div>

                <div>
                    <Label>Alamat</Label>
                    <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
                </div>

                <div>
                    <Label>Kota</Label>
                    <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                </div>

                <div>
                    <Label>Provinsi</Label>
                    <Input value={data.province} onChange={(e) => setData('province', e.target.value)} />
                </div>

                <div>
                    <Label>Kode Pos</Label>
                    <Input value={data.poscode} onChange={(e) => setData('poscode', e.target.value)} />
                </div>

                <div>
                    <Label>Status *</Label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v as 'active' | 'inactive')}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={processing || !isValid}>
                    {submitLabel}
                </Button>

                <Link href={route('office.index')}>
                    <Button type="button" variant="outline">
                        Batal
                    </Button>
                </Link>
            </div>
        </form>
    );
}
