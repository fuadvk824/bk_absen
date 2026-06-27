import { Link } from '@inertiajs/react';
import type React from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Office } from '@/types/type-table/office';
import OfficeMapPicker from '@/components/absen-map/office-map-picker';
import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    data: Office;
    existingImage?: string | null;
    setData: <K extends keyof Office>(key: K, value: Office[K]) => void;
    errors: Partial<Record<keyof Office, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitLabel?: string;
};

export default function OfficeForm({ data, existingImage, setData, errors, processing, onSubmit, submitLabel }: Props) {
    const isValid = data.name.trim() !== '' && data.latitude !== 0 && data.longitude !== 0 && data.radius_meter > 0;

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <form onSubmit={onSubmit} className="w-full space-y-4 rounded p-6 pb-20 shadow">
            <h1 className="text-xl font-semibold">{submitLabel} Kantor</h1>
            <div className="space-y-4">
                <div>
                    <Label>Lokasi Kantor</Label>

                    <OfficeMapPicker
                        latitude={data.latitude ? Number(data.latitude) : null}
                        longitude={data.longitude ? Number(data.longitude) : null}
                        onChange={(lat, lng) => {
                            setData('latitude', lat);
                            setData('longitude', lng);
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label>Latitude *</Label>
                        <Input
                            type="number"
                            step="any"
                            value={data.latitude ?? ''}
                            onChange={(e) => setData('latitude', Number(e.target.value))}
                            className="no-spinner"
                        />
                        {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
                    </div>

                    <div>
                        <Label>Longitude *</Label>
                        <Input
                            type="number"
                            step="any"
                            value={data.longitude ?? ''}
                            onChange={(e) => setData('longitude', Number(e.target.value))}
                            className="no-spinner"
                        />
                        {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
                    </div>

                    <div>
                        <Label>Radius (Meter) *</Label>
                        <Input
                            type="number"
                            min={10}
                            value={data.radius_meter ?? 20}
                            onChange={(e) => setData('radius_meter', Number(e.target.value))}
                            className="no-spinner"
                        />
                        {errors.radius_meter && <p className="text-sm text-red-500">{errors.radius_meter}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Label>Foto Kantor</Label>

                        <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="flex h-72 items-center justify-center overflow-hidden rounded-md border bg-background">
                                {data.image && typeof data.image !== 'string' ? (
                                    <img
                                        src={URL.createObjectURL(data.image)}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : existingImage ? (
                                    <img src={existingImage} alt="Current" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-sm text-muted-foreground">Belum ada gambar</span>
                                )}
                            </div>

                            <Input
                                ref={fileInputRef}
                                className="mt-4"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        setData('image', file);
                                    }
                                }}
                            />

                            {(data.image || existingImage) && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="mt-3 w-full"
                                    onClick={() => {
                                        setData('image', null);

                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    Hapus Gambar
                                </Button>
                            )}

                            {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:col-span-2">
                        <div>
                            <Label>Nama *</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <Label>Timezone *</Label>
                            <Select value={data.timezone ?? ''} onValueChange={(v) => setData('timezone', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Timezone" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>

                                    <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>

                                    <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>No Telepon</Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
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

                        <div className="md:col-span-2">
                            <Label>Alamat</Label>
                            <Textarea
                                className="text-xs"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={4}
                            />
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

                        <div className="flex items-end justify-end gap-2 pt-8 md:pt-0">
                            <Button type="submit" disabled={processing || !isValid}>
                                {submitLabel}
                            </Button>

                            <Link href={route('office.index')}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
