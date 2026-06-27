import type { ColumnDef } from '@tanstack/react-table';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';

export interface Employee {
    id: number;
    name: string;

    office: {
        name: string;
    };
    eligible: boolean;
    masa_kerja: number;
    already_assigned: boolean;
}

export const columnAssignLeave = (
    employees: Employee[],
    selectedIds: number[],
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>,
): ColumnDef<Employee>[] => [
    {
        id: 'select',

        header: () => {
            const selectableEmployees = employees.filter((emp) => !emp.already_assigned);
            const selectableIds = selectableEmployees.map((e) => e.id);
            const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
            const someSelected = selectableIds.some((id) => selectedIds.includes(id)) && !allSelected;

            return (
                <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={() => {
                        if (allSelected) {
                            setSelectedIds([]);
                        } else {
                            setSelectedIds(selectableIds);
                        }
                    }}
                />
            );
        },

        cell: ({ row }) => {
            const employee = row.original;

            return (
                <Checkbox
                    disabled={employee.already_assigned || !employee.eligible}
                    checked={employee.already_assigned ? true : selectedIds.includes(employee.id)}
                    onCheckedChange={() => {
                        setSelectedIds((prev) =>
                            prev.includes(employee.id) ? prev.filter((id) => id !== employee.id) : [...prev, employee.id],
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
        cell: ({ row }) => <span>{row.original.masa_kerja}</span>,
    },
    
    {
        accessorKey: 'status', 
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
