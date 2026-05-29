<?php

namespace Database\Seeders;

use App\Models\Position;
use App\Services\CodeGeneratorService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        DB::transaction(function () {
            $codeGenerator = new CodeGeneratorService();

            $positionNames = [
                'Area Koordinator',
                'Person In Charge',
                'HELPER',
                'DRIVER',
                'Warehouse',
                'PURCHASING',
                'Second Layer PIC',
                'ADMIN',
                'Team Creative',
                'Crew store',
                'FINANCE',
                'TRAINER',
                'STAFF'
            ];

            foreach ($positionNames as $name) {
                $positionCode = $codeGenerator->generate(Position::class, 'position_code', 'OFC', 3);

                Position::create([
                    'position_code' => $positionCode,
                    'name' => $name,
                ]);
            }
        });
    }
}
