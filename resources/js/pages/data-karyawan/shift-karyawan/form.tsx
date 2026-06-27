import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ShiftDetail {
    day_of_week: string;
    is_active: boolean;
    checkin_time: string | null;
    checkout_time: string | null;
    breaktime_start: string | null;
    breaktime_end: string | null;
}

interface ShiftFormProps {
    data: {
        name_shift: string;
        toleransi_late: number;
        denda_alpha: number;
        shift_details: ShiftDetail[];
    };
    setData: any;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
}

export default function ShiftForm({ data, setData, errors, processing, onSubmit, submitLabel }: ShiftFormProps) {
    const handleDetailChange = (index: number, field: keyof ShiftDetail, value: any) => {
        const updatedDetails = [...data.shift_details];
        updatedDetails[index] = {
            ...updatedDetails[index],
            [field]: value,
        };
        setData('shift_details', updatedDetails);
    };

    return (
        <div className="space-y-4 p-5">
            <h1 className="text-xl font-semibold">{submitLabel} Shift</h1>

            <form onSubmit={onSubmit} className="mb-20 flex flex-col gap-4">
                <div className="rounded-xl border p-4">
                    <h3 className="mb-4 text-sm font-semibold">Kategori Shift</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label>Nama Shift</Label>
                            <Input value={data.name_shift} onChange={(e) => setData('name_shift', e.target.value)} />
                            {errors.name_shift && <p className="text-sm text-red-500">{errors.name_shift}</p>}
                        </div>

                        <div>
                            <Label>Toleransi Terlambat (menit)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.toleransi_late}
                                onChange={(e) => setData('toleransi_late', Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label>Denda Ketidakhadiran</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.denda_alpha}
                                onChange={(e) => setData('denda_alpha', Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <h3 className="mb-4 text-sm font-semibold">Detail Shift Per Hari</h3>
                    <div className="flex flex-col gap-2">
                        {data.shift_details.map((detail, index) => (
                            <div key={detail.day_of_week} className="space-y-3 rounded-xl border p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium capitalize">{detail.day_of_week}</h4>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Aktif</span>
                                        <Switch
                                            checked={detail.is_active}
                                            onCheckedChange={(checked) => handleDetailChange(index, 'is_active', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-4">
                                    <div>
                                        <Label>Jam Masuk</Label>
                                        <Input
                                            type="time"
                                            disabled={!detail.is_active}
                                            value={detail.checkin_time ?? ''}
                                            onChange={(e) => handleDetailChange(index, 'checkin_time', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Jam Pulang</Label>
                                        <Input
                                            type="time"
                                            disabled={!detail.is_active}
                                            value={detail.checkout_time ?? ''}
                                            onChange={(e) => handleDetailChange(index, 'checkout_time', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Mulai Istirahat</Label>
                                        <Input
                                            type="time"
                                            disabled={!detail.is_active}
                                            value={detail.breaktime_start ?? ''}
                                            onChange={(e) => handleDetailChange(index, 'breaktime_start', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Selesai Istirahat</Label>
                                        <Input
                                            type="time"
                                            disabled={!detail.is_active}
                                            value={detail.breaktime_end ?? ''}
                                            onChange={(e) => handleDetailChange(index, 'breaktime_end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className="cursor-pointer">
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
