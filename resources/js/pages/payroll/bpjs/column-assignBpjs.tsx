import type { ColumnDef } from '@tanstack/react-table';
import type React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface Employee {
    id: number;
    name: string;
    office: { name: string };
    masa_kerja: string;
    masa_kerja_bulan: number;
    eligible: boolean;
    already_assigned: boolean;
    bpjs: number | null;
}

export const columnAssignBpjs = (
    employees: Employee[],
    selectedIds: number[],
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>,
): ColumnDef<Employee>[] => [
    {
        id: 'select',
        header: () => {
            const selectable = employees.filter((e) => e.eligible && !e.already_assigned);

            const ids = selectable.map((e) => e.id);
            const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
            const someSelected = ids.some((id) => selectedIds.includes(id));

            return (
                <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={() => {
                        setSelectedIds((prev) =>
                            allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])],
                        );
                    }}
                />
            );
        },

        cell: ({ row }) => {
            const employee = row.original;
            const alreadyAssigned = employee.already_assigned === true;
            const isSelected = selectedIds.includes(employee.id);

            return (
                <Checkbox
                    disabled={!employee.eligible || alreadyAssigned}
                    checked={alreadyAssigned || isSelected}
                    className={alreadyAssigned ? 'cursor-not-allowed opacity-50' : ''}
                    onCheckedChange={(checked) => {
                        if (alreadyAssigned || !employee.eligible) {
                            return;
                        }

                        setSelectedIds((prev) =>
                            checked === true
                                ? [...new Set([...prev, employee.id])]
                                : prev.filter((id) => id !== employee.id),
                        );
                    }}
                />
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Nama Karyawan',
    },
    {
        accessorFn: (row) => row.office.name,
        id: 'office',
        header: 'Office',
    },
    {
        accessorKey: 'masa_kerja',
        header: 'Masa Kerja',
    },
    
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const employee = row.original;

            if (employee.already_assigned) {
                return 'Sudah Assign';
            }

            if (!employee.eligible) {
                return 'Belum Memenuhi Masa Bakti';
            }

            return 'Bisa Assign';
        },
    },
];
