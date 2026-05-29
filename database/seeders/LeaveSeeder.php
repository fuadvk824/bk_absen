<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;

class LeaveSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::whereNotNull('shift_id')->get();

        $dataTemplate = [
            [
                'leave_categories_id' => 1,
                'start_date' => '2024-01-10',
                'end_date' => '2024-01-12',
                'total_days' => 3,
                'file' => null,
                'reason' => 'Liburan keluarga',
                'status' => 'approved',
            ],
            [
                'leave_categories_id' => 2,
                'start_date' => '2024-02-05',
                'end_date' => '2024-02-06',
                'total_days' => 2,
                'file' => 'sick_letter.pdf',
                'reason' => 'Sakit demam',
                'status' => 'approved',
            ],
            [
                'leave_categories_id' => 1,
                'start_date' => '2024-03-15',
                'end_date' => '2024-03-16',
                'total_days' => 2,
                'file' => null,
                'reason' => 'Acara keluarga',
                'status' => 'rejected',
            ],
        ];

        $insertData = [];

        foreach ($employees as $employee) {
            foreach ($dataTemplate as $template) {
                $insertData[] = [
                    'employee_id' => $employee->id,
                    'submit' => now(),
                    'leave_categories_id' => $template['leave_categories_id'],
                    'start_date' => $template['start_date'],
                    'end_date' => $template['end_date'],
                    'total_days' => $template['total_days'],
                    'file' => $template['file'],
                    'reason' => $template['reason'],
                    'status' => $template['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('leaves')->insert($insertData);
    }
}