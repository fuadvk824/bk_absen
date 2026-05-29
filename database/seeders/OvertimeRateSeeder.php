<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OvertimeRateSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('overtime_rates')->insert([
            [
                'name' => 'Hari Kerja',
                'rate_per_hour' => 10000,
                'effective_from' => '2024-01-01',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hari Libur',
                'rate_per_hour' => 10000,
                'effective_from' => '2024-01-01',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}