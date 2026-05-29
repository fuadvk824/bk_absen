<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveCategory;

class LeaveCategorySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'leave_code' => 'LVE001A',
                'leave_name' => 'Cuti Tahunan',
                'max_days' => 12,
                'masa_bakti' => 12,
                'reset' => 'yearly',
            ],
            [
                'leave_code' => 'LVE002A',
                'leave_name' => 'Cuti Sakit',
                'max_days' => 6,
                'masa_bakti' => null,
                'reset' => null,
            ],
            [
                'leave_code' => 'LVE003A',
                'leave_name' => 'Cuti Melahirkan',
                'max_days' => 90,
                'masa_bakti' => null,
                'reset' => null,
            ],
            [
                'leave_code' => 'LVE004A',
                'leave_name' => 'Cuti Khusus',
                'max_days' => 3,
                'masa_bakti' => null,
                'reset' => null,
            ],
        ];

        foreach ($data as $item) {
            LeaveCategory::create($item);
        }
    }
}