import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { toast } from 'sonner';

interface Props {
    close: () => void;

    employees: {
        id: number;
        name: string;
    }[];

    initialData?: any;
}

export default function Form({ close, employees, initialData }: Props) {
    const isEdit = !!initialData;

    const { data, setData, post, put, processing, errors } = useForm({
        employee_id: initialData?.employee_id?.toString() ?? '',

        daily_salary: initialData?.daily_salary ?? '',

        effective_from: initialData?.effective_from ?? '',
    });

    const handleSuccess = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) toast.success(flash.success);

        if (flash?.error) toast.error(flash.error);

        close();
    };

    const handleError = () => {
        toast.error(isEdit ? 'Gagal mengupdate salary' : 'Gagal menambahkan salary');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: handleSuccess,

            onError: handleError,
        };

        if (isEdit) {
            put(route('salary.update', initialData.id), options);
        } else {
            post(route('salary.store'), options);
        }
    };

    return (
        <form onSubmit={submit} className="mt-4 space-y-5">
            {!isEdit && (
                <div className="grid grid-cols-3 items-start gap-3">
                    <div className="flex flex-col gap-1">
                        <Label>Karyawan*</Label>

                        <Label className="text-xs text-muted-foreground">Pilih karyawan</Label>
                    </div>

                    <Select
                        value={data.employee_id?.toString()}
                        onValueChange={(value) => setData('employee_id', Number(value))}
                        disabled={isEdit}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih karyawan" />
                        </SelectTrigger>

                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                    {emp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid grid-cols-3 items-start gap-3">
                <div className="flex flex-col gap-1">
                    <Label>Daily Salary*</Label>

                    <Label className="text-xs text-muted-foreground">Gaji harian karyawan</Label>
                </div>

                <div className="col-span-2">
                    <Input
                        type="number"
                        placeholder="0"
                        value={data.daily_salary}
                        onChange={(e) => setData('daily_salary', e.target.value)}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />

                    {errors.daily_salary && <p className="mt-1 text-sm text-red-500">{errors.daily_salary}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 items-start gap-3">
                <div className="flex flex-col gap-1">
                    <Label>Effective From*</Label>

                    <Label className="text-xs text-muted-foreground">Tanggal mulai berlaku</Label>
                </div>

                <div className="col-span-2">
                    <Input
                        type="date"
                        value={data.effective_from}
                        onChange={(e) => setData('effective_from', e.target.value)}
                    />

                    {errors.effective_from && <p className="mt-1 text-sm text-red-500">{errors.effective_from}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={close}>
                    Batal
                </Button>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}
