import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import type { LetterEmployee, LetterType } from '@/types/type-table/letter';

import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
    close: () => void;

    employees: LetterEmployee[];

    initialData?: {
        id?: number;
        employee_id: number | null;
        name: string;
        nomor_surat: string;
        jenis_surat: LetterType;
        tanggal_surat: string;
        alasan_surat: string;
    };
}

type LetterFormData = {
    employee_id: string;
    nomor_surat: string;
    jenis_surat: LetterType | '';
    tanggal_surat: string;
    alasan_surat: string;
};

const MAX_INITIAL_EMPLOYEES = 50;

export default function Form({ close, employees, initialData }: Props) {
    const isEdit = !!initialData;

    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    */

    const [employeeOpen, setEmployeeOpen] = useState(false);

    const [employeeSearch, setEmployeeSearch] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, put, processing, errors, reset } = useForm<LetterFormData>({
        employee_id: initialData?.employee_id ? String(initialData.employee_id) : '',

        nomor_surat: initialData?.nomor_surat ?? '',

        jenis_surat: initialData?.jenis_surat ?? '',

        tanggal_surat: initialData?.tanggal_surat ?? new Date().toISOString().split('T')[0],

        alasan_surat: initialData?.alasan_surat ?? '',
    });

    /*
    |--------------------------------------------------------------------------
    | Filter Employees
    |--------------------------------------------------------------------------
    */

    const filteredEmployees = useMemo(() => {
        const search = employeeSearch.trim().toLowerCase();

        /*
         * Kalau belum mengetik pencarian,
         * jangan render semua employee.
         */
        if (!search) {
            return employees.slice(0, MAX_INITIAL_EMPLOYEES);
        }

        /*
         * Kalau user mencari,
         * tampilkan semua hasil pencarian.
         */
        return employees.filter((employee) => {
            const name = employee.name.toLowerCase();

            const code = employee.employee_code.toLowerCase();

            return name.includes(search) || code.includes(search);
        });
    }, [employees, employeeSearch]);

    /*
    |--------------------------------------------------------------------------
    | Selected Employee
    |--------------------------------------------------------------------------
    */

    const selectedEmployee = useMemo(() => {
        if (!data.employee_id) {
            return null;
        }

        return employees.find((employee) => String(employee.id) === data.employee_id);
    }, [employees, data.employee_id]);

    /*
    |--------------------------------------------------------------------------
    | Toast
    |--------------------------------------------------------------------------
    */

    const handleToast = (page: any) => {
        const flash = page.props.flash as {
            success?: string;
            error?: string;
        };

        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const options = {
            onSuccess: (page: any) => {
                handleToast(page);

                close();

                reset();
            },
        };

        if (isEdit) {
            put(
                route('letter.update', {
                    letter: initialData?.id,
                }),
                options,
            );

            return;
        }

        post(route('letter.store'), options);
    };

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const isValid =
        data.employee_id !== '' &&
        data.nomor_surat.trim() !== '' &&
        data.jenis_surat !== '' &&
        data.tanggal_surat !== '' &&
        data.alasan_surat.trim() !== '';

    return (
        <form onSubmit={submit} className="mt-4 space-y-4">

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Karyawan*</Label>

                <div className="col-span-2">
                    <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={employeeOpen}
                                className="w-full justify-between font-normal"
                            >
                                <span className="truncate">
                                    {selectedEmployee ? selectedEmployee.name : 'Pilih Karyawan'}
                                </span>

                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="Cari nama / kode karyawan..."
                                    value={employeeSearch}
                                    onValueChange={setEmployeeSearch}
                                />

                                <div
                                    className="max-h-64 overflow-y-auto overscroll-contain"
                                    onWheel={(event) => {
                                        event.stopPropagation();
                                    }}
                                >
                                    <CommandList className="!max-h-none !overflow-visible">
                                        <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>

                                        <CommandGroup>
                                            {filteredEmployees.map((employee) => {
                                                const value = String(employee.id);

                                                return (
                                                    <CommandItem
                                                        key={employee.id}
                                                        value={value}
                                                        onSelect={() => {
                                                            setData('employee_id', value);

                                                            setEmployeeOpen(false);

                                                            setEmployeeSearch('');
                                                        }}
                                                    >
                                                        {employee.name}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </div>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {!employeeSearch && employees.length > MAX_INITIAL_EMPLOYEES && (
                        <p className="mt-1 text-xs text-muted-foreground">Ketik nama atau kode karyawan untuk mencari.</p>
                    )}

                    {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Nomor Surat*</Label>

                <div className="col-span-2">
                    <Input
                        value={data.nomor_surat}
                        onChange={(event) => setData('nomor_surat', event.target.value)}
                        placeholder="Contoh: 001/SP/HRD/VIII/2026"
                    />

                    {errors.nomor_surat && <p className="text-sm text-red-500">{errors.nomor_surat}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Jenis Surat*</Label>

                <div className="col-span-2">
                    <Select
                        value={data.jenis_surat || 'none'}
                        onValueChange={(value) => setData('jenis_surat', value === 'none' ? '' : (value as LetterType))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Jenis Surat" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="none">Pilih Jenis Surat</SelectItem>
                            <SelectItem value="SP1">SP1</SelectItem>
                            <SelectItem value="SP2">SP2</SelectItem>
                            <SelectItem value="SP3">SP3</SelectItem>
                            <SelectItem value="probation">Probation</SelectItem>
                            <SelectItem value="paklaring">Paklaring</SelectItem>
                        </SelectContent>
                    </Select>

                    {errors.jenis_surat && <p className="text-sm text-red-500">{errors.jenis_surat}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-3">
                <Label>Tanggal*</Label>

                <div className="col-span-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />

                                {data.tanggal_surat ? (
                                    format(new Date(data.tanggal_surat), 'dd MMMM yyyy', {
                                        locale: id,
                                    })
                                ) : (
                                    <span className="text-muted-foreground">Pilih tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={data.tanggal_surat ? new Date(data.tanggal_surat) : undefined}
                                onSelect={(date) => setData('tanggal_surat', date ? format(date, 'yyyy-MM-dd') : '')}
                                locale={id}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>

                    {errors.tanggal_surat && <p className="text-sm text-red-500">{errors.tanggal_surat}</p>}
                </div>
            </div>


            <div className="grid grid-cols-3 items-start gap-3">
                <Label>Alasan*</Label>

                <div className="col-span-2">
                    <textarea
                        value={data.alasan_surat}
                        onChange={(event) => setData('alasan_surat', event.target.value)}
                        placeholder="Masukkan alasan surat..."
                        rows={15}
                        className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                    />

                    {errors.alasan_surat && <p className="text-sm text-red-500">{errors.alasan_surat}</p>}
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                    Batal
                </Button>

                <Button type="submit" disabled={processing || !isValid}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </DialogFooter>
        </form>
    );
}
 