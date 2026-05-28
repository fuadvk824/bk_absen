import type { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export interface Employee {
    id: number;
    office_id: number;

    current_month_shift_id?: number | null;
    current_month_shift_name?: string | null;

    name: string;
    office: {
        name: string;
    };
    shift?: {
        id: number;
        name_shift: string;
    } | null;
}

export const columnAssignShift = (
    shiftId: number,
    employees: Employee[],
    selectedIds: number[],
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>,
): ColumnDef<Employee>[] => [
    {
        id: 'select',

        header: () => {
            const selectableEmployees = employees.filter((emp) => emp.current_month_shift_id !== shiftId);

            const selectableIds = selectableEmployees.map((e) => e.id);
            const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
            const someSelected = selectableIds.some((id) => selectedIds.includes(id)) && !allSelected;

            return (
                <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={() => {
                        if (allSelected) {
                            setSelectedIds((prev) => prev.filter((id) => !selectableIds.includes(id)));
                        } else {
                            setSelectedIds((prev) => [...new Set([...prev, ...selectableIds])]);
                        }
                    }}
                />
            );
        },

        cell: ({ row }) => {
            const employee = row.original;
            const alreadyThisShift = employee.current_month_shift_id === shiftId;

            return (
                <Checkbox
                    disabled={alreadyThisShift}
                    checked={alreadyThisShift || selectedIds.includes(employee.id)}
                    
                    onCheckedChange={() => {
                        if (!alreadyThisShift) {
                            setSelectedIds((prev) =>
                                prev.includes(employee.id)
                                    ? prev.filter((id) => id !== employee.id)
                                    : [...prev, employee.id],
                            );
                        }
                    }}
                />
            );
        },
    },

    {
        id: 'employee_name',
        header: 'Nama Karyawan',
        cell: ({ row }) => {
            const employee = row.original;
            return (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{employee.id}</span>
                    <span>{employee.name}</span>
                </div>
            );
        },
    },

    {
        accessorFn: (row) => row.office.name,
        id: 'office_name',
        header: 'Office',
    },

    {
        accessorFn: (row) => row.current_month_shift_name ?? '-',

        id: 'shift_name',
        header: 'Schedule Aktif',
    },
];
