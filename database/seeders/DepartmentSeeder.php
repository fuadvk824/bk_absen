<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Department;
use App\Services\CodeGeneratorService;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            $codeGenerator = new CodeGeneratorService();

            $departmentNames = [
                'Departemen Penjualan',
                'Departemen Operasional',
                'Departemen Administrasi',
                'Departemen Sumber Daya Manusia (HR)',
                'Departemen Digital Marketing',
                'Departemen TI (Teknologi Informasi)',
                'Kosong'
            ];

            foreach ($departmentNames as $name) {

                $departmentCode = $codeGenerator->generate(
                    Department::class,
                    'department_code',
                    'DPT',
                    3
                );

                Department::create([
                    'department_code' => $departmentCode,
                    'name' => $name,
                ]);
            }
        });
    }
}

