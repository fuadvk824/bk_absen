import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface Props {
    close: () => void;
    initialData?: {
        id?: number;
        name: string;
    };
}

export default function Form({ close, initialData }: Props) {
    const isEdit = !!initialData;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: initialData?.name ?? '',
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
            put(route('department.update', initialData?.id), options);
        } else {
            post(route('department.store'), options);
        }
    };

    const isValid = data.name.trim() !== '';

    return (
        <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 items-center gap-3">
                <div className="flex flex-col gap-1">
                    <Label>Nama*</Label>
                    <Label className="text-xs text-[#919191]">(departemen)</Label>
                </div>

                <div className="col-span-2">
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
