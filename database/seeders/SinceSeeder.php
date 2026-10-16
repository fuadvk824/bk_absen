<?php

namespace Database\Seeders;

use App\Models\OffdayRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SinceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('offday_requests')
            ->whereNull('since')
            ->whereNotNull('created_at')
            ->update([
                'since' => DB::raw('created_at'),
            ]);
    }
}
