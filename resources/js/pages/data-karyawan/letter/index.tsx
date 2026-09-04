import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { VisibilityState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/table/datatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { Letter, LetterEmployee, LetterType } from '@/types/type-table/letter';

import { useTableActions } from '@/lib/useTableAction';
import { Mail, RefreshCw } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { columnLetters } from './column-letter';
import Form from './form';
import { PaginationMeta } from '@/types/pagination';

interface Props {
    letters: {
        data: Letter[];
        meta: PaginationMeta;
    };

    employees: LetterEmployee[];

    filters: {
        search?: string;
        jenis_surat?: LetterType;
        perPage?: number;
    };
}



export default function Index({ letters, employees, filters }: Props) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const allColumns = ['name', 'name_office', 'nomor_surat', 'jenis_surat', 'tanggal_surat', 'alasan_surat'];

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        jenis_surat: filters.jenis_surat ?? '',
        perPage: filters.perPage ?? 10,
    });

    const { handleFilterChange } = useTableActions({
        filters: localFilters,
        indexRoute: 'letter.index',
        exportRoute: 'letter.export',
        allColumns,
    });

    const openCreate = () => {
        setSelectedLetter(null);
        setOpen(true);
    };

    const openEdit = (letter: Letter) => {
        setSelectedLetter(letter);
        setOpen(true);
    };

    const columns = useMemo(() => columnLetters(openEdit), []);

    const handleResetFilters = () => {
        setIsRefreshing(true);

        const defaultFilters = {
            search: '',
            jenis_surat: '',
            perPage: 10,
        };

        setLocalFilters(defaultFilters);

        router.get(
            route('letter.index'),
            {},
            {
                replace: true,
                preserveScroll: true,

                onFinish: () => {
                    setIsRefreshing(false);
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Surat',
                    href: route('letter.index'),
                },
            ]}
        >
            <Head title="Surat" />

            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        <span className="hidden sm:inline">Data</span> Surat
                    </h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="cursor-pointer"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />

                            <span className="hidden sm:block">Refresh</span>
                        </Button>

                        <Button className="cursor-pointer text-xs" onClick={openCreate}>
                            <Mail className="h-4 w-4" />

                            <span className="hidden sm:block">Tambah</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="space-y-1">
                        <Label className="text-[11px]">Cari Surat</Label>

                        <Input
                            placeholder="Nama, nomor surat..."
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
                            className="h-7 p-4 placeholder:text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Jenis Surat</Label>

                        <Select
                            value={localFilters.jenis_surat || 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    localFilters,
                                    setLocalFilters,
                                    'jenis_surat',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-7 p-4">
                                <SelectValue placeholder="Semua jenis surat" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="SP1">SP1</SelectItem>
                                <SelectItem value="SP2">SP2</SelectItem>
                                <SelectItem value="SP3">SP3</SelectItem>
                                <SelectItem value="probation">Probation</SelectItem>
                                <SelectItem value="paklaring">Paklaring</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedLetter ? 'Edit Surat' : 'Tambah Surat'}</DialogTitle>

                            <DialogDescription>
                                {selectedLetter
                                    ? 'Perbarui data surat yang dipilih dan simpan perubahan.'
                                    : 'Tambahkan surat baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        {open && (
                            <Form
                                key={selectedLetter?.id ?? 'create'}
                                close={() => setOpen(false)}
                                employees={employees}
                                initialData={
                                    selectedLetter
                                        ? {
                                              id: selectedLetter.id,
                                              employee_id: selectedLetter.employee_id,
                                              name: selectedLetter.name,
                                              nomor_surat: selectedLetter.nomor_surat,
                                              jenis_surat: selectedLetter.jenis_surat,
                                              tanggal_surat: selectedLetter.tanggal_surat,
                                              alasan_surat: selectedLetter.alasan_surat,
                                          }
                                        : undefined
                                }
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <DataTable<Letter>
                    columns={columns}
                    data={letters.data}
                    meta={letters.meta}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    perPage={localFilters.perPage}
                    onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
                />
            </div>
        </AppLayout>
    );
}
 