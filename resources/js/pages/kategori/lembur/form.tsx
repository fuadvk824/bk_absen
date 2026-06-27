import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { formatRupiah } from '@/lib/formatRupiah';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface Props {
    close: () => void;
    initialData?: {
        id?: number;
        name: string;
        rate_per_hour: number;
        effective_from: string;
        is_active: boolean;
    };
}

const handleToast = (page: any) => {
    const flash = page.props.flash as {
        success?: string;
        error?: string;
    };

    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};

export default function Form({ close, initialData }: Props) {
    const isEdit = !!initialData;

    const { data, setData, post, put, processing, errors } = useForm({
        name: initialData?.name ?? '',
        rate_per_hour: initialData?.rate_per_hour ?? 0,
        effective_from: initialData?.effective_from ?? '',
        is_active: initialData?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            // onSuccess: () => close(),
            onSuccess: (page: any) => {
                handleToast(page);
                close();
            },
        };

        if (isEdit) {
            put(route('overtime-rate.update', initialData?.id), options);
        } else {
            post(route('overtime-rate.store'), options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <Label>Nama</Label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
                <Label>Bonus per Jam</Label>

                <Input
                    type="text"
                    value={formatRupiah(data.rate_per_hour || 0)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setData('rate_per_hour', Number(raw));
                    }}
                    className={cn('text-xs', errors.rate_per_hour && 'border-red-500')}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Berlaku Mulai</Label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'justify-start text-left font-normal',
                                !data.effective_from && 'text-muted-foreground',
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />

                            {data.effective_from ? format(new Date(data.effective_from), 'dd MMMM yyyy') : 'Pilih tanggal'}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align='start'>
                        <Calendar
                            mode="single"
                            selected={data.effective_from ? new Date(data.effective_from) : undefined}
                            onSelect={(date) => {
                                if (date) {
                                    setData('effective_from', format(date, 'yyyy-MM-dd'));
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {errors.effective_from && <p className="text-sm text-red-500">{errors.effective_from}</p>}
            </div>

            <div className="flex items-center gap-3">
                <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />

                <Label>Aktif</Label>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                    Batal
                </Button>

                <Button type="submit" disabled={processing}>
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    );
}
