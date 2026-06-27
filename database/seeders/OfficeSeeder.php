<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\CodeGeneratorService;

class OfficeSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $rows = Excel::toCollection(null, storage_path('app/officebk.xlsx'))[0];

            $codeGenerator = new CodeGeneratorService();

            foreach ($rows as $index => $row) {
                $name = $row[0];
                $phone = $row[1];
                $address = $row[2];
                $city = $row[3];
                $province = $row[4];
                $poscode = $row[5];
                $status = $row[6];
                $latitude = $row[7];
                $longitude = $row[8];

                $officeCode = $codeGenerator->generate(Office::class, 'office_code', 'OFC', 3);

                Office::create([
                    'office_code' => $officeCode,
                    'name' => $name,
                    'image' => null,
                    'phone' => $phone,
                    'address' => $address,
                    'city' => $city,
                    'province' => $province,
                    'poscode' => $poscode,
                    'status' => $status,

                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'radius_meter' => 20,
                ]);
            }
        });
    }
}
