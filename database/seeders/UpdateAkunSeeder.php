<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Office;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Maatwebsite\Excel\Facades\Excel;

class UpdateAkunSeeder extends Seeder
{
    public function run(): void
    {
        $departmentNames = [
            'Departemen Penjualan',
            'Departemen Operasional',
            'Departemen Administrasi',
            'Departemen Sumber Daya Manusia (HR)',
            'Departemen Digital Marketing',
            'Departemen TI (Teknologi Informasi)',
            'Kosong',
        ];

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
            'STAFF',
        ];

        $offices = Office::pluck('id', 'name')->mapWithKeys(
            fn($id, $name) => [
                trim(strtolower($name)) => $id,
            ]
        );

        $departments = collect($departmentNames)->mapWithKeys(function ($name, $index) {
            return [
                trim(strtolower($name)) => $index + 1,
            ];
        });

        $positions = collect($positionNames)->mapWithKeys(function ($name, $index) {
            return [
                trim(strtolower($name)) => $index + 1,
            ];
        });

        $rows = Excel::toCollection(null, storage_path('app/EmployeeSeed.xlsx'))[0];

        $rows = $rows->skip(1);

        foreach ($rows as $row) {

            $email = $row[2] ?? null;

            if (empty($email)) {
                continue;
            }

            $user = User::where('email', $email)->first();

            if (!$user) {
                continue;
            }

            $phone = $row[3] ?? null;
            $address = $row[4] ?? null;
            $tanggalLahir = $row[5] ?? null;

            $jenisKelaminRaw = strtolower(trim($row[6] ?? ''));

            $jenisKelamin = match ($jenisKelaminRaw) {
                'laki-laki',
                'laki laki',
                'lakilaki',
                'l' => 'L',

                'perempuan',
                'p' => 'P',

                default => null,
            };

            $departmentName = $row[7] ?? null;
            $tanggalMasuk = $row[8] ?? null;
            $noRek = $row[10] ?? null;
            $positionName = $row[11] ?? null;
            $officeName = $row[12] ?? null;
            $pend_last = $row[13] ?? null;


            try {
                $tanggalLahir = $tanggalLahir
                    ? Carbon::parse($tanggalLahir)->format('Y-m-d')
                    : null;
            } catch (\Exception $e) {
                $tanggalLahir = null;
            }

            try {
                $tanggalMasuk = $tanggalMasuk
                    ? Carbon::parse($tanggalMasuk)->format('Y-m-d')
                    : null;
            } catch (\Exception $e) {
                $tanggalMasuk = null;
            }


            $officeId = $officeName
                ? $offices[trim(strtolower($officeName))] ?? null
                : null;

            $departmentId = $departmentName
                ? $departments[trim(strtolower($departmentName))] ?? null
                : null;

            $positionId = $positionName
                ? $positions[trim(strtolower($positionName))] ?? null
                : null;

            $user->update([
                'jenis_kelamin' => $jenisKelamin,
                'tanggal_lahir' => $tanggalLahir,
                'alamat' => $address,
                'no_telepon' => $phone,
                'no_rek' => $noRek,
                'pend_last' => $pend_last,
            ]);

            $employee = Employee::where('user_id', $user->id)->first();

            if ($employee) {
                $employee->update([
                    'office_id' => $officeId,
                    'department_id' => $departmentId,
                    'position_id' => $positionId,
                    'tanggal_awal_kerja' => $tanggalMasuk,
                ]);
            }
        }
    }
}
