import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    close: () => void;
    initialData?: {
        id?: number;
        leave_name: string;
        max_days: number;
        masa_bakti: number;
        reset: string;
    };
}

export default function Form({ close, initialData }: Props) {
    const isEdit = !!initialData;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        leave_name: initialData?.leave_name ?? '',
        max_days: initialData?.max_days ?? 0,
        masa_bakti: initialData?.masa_bakti ?? 0,
        reset: initialData?.reset ?? '',
    });


      const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    };
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: (page: any) => {
                handleToast(page);
                close();  
                reset();  
            },
        };

        if (isEdit) {
            put(route('leave.update', initialData?.id), options);
        } else {
            post(route('leave.store'), options);
        }
    };

    const isValid = data.leave_name.trim() !== '';

    return (
        <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 items-center gap-3">
                <div className="flex flex-col gap-1">
                    <Label>Nama*</Label>
                    <Label className="text-xs text-[#919191]">(Kategori cuti)</Label>
                </div>

                <div className="col-span-2">
                    <Input value={data.leave_name} onChange={(e) => setData('leave_name', e.target.value)} />
                    {errors.leave_name && <p className="text-sm text-red-500">{errors.leave_name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Maksimal Hari</Label>

                <div className="col-span-2 flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setData('max_days', Math.max(0, data.max_days - 1))}
                    >
                        -
                    </Button>

                    <Input
                        type="number"
                        value={data.max_days}
                        onChange={(e) => setData('max_days', Math.max(0, Number(e.target.value)))}
                        className="[appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setData('max_days', data.max_days + 1)}
                    >
                        +
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <div className="flex flex-col gap-1">
                    <Label>Masa Bakti</Label>
                    <Label className="text-xs text-[#919191]">(Dalam bulan)</Label>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setData('masa_bakti', Math.max(0, data.masa_bakti - 1))}
                    >
                        -
                    </Button>

                    <Input
                        type="number"
                        value={data.masa_bakti}
                        onChange={(e) => setData('masa_bakti', Math.max(0, Number(e.target.value)))}
                        className="[appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setData('masa_bakti', data.masa_bakti + 1)}
                    >
                        +
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Reset Cuti</Label>

                <div className="col-span-2">
                    <Select value={data.reset} onValueChange={(value) => setData('reset', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih reset cuti" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="bulanan">Bulanan</SelectItem>
                            <SelectItem value="tahunan">Tahunan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                    Batal
                </Button>

                <Button type="submit" disabled={processing || !isValid}>
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    );
}
