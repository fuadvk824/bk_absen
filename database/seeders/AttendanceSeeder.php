<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        if ($employees->isEmpty()) {
            $this->command->warn('Data employee belum tersedia.');
            return;
        }

        $today = Carbon::today();

        foreach ($employees as $employee) {
            

            Attendance::create([
                'employee_id' => $employee->id,

                'gambar_checkin' => null,
                'gambar_checkout' => null,

                'tanggal' => $today->toDateString(),
                'name_shift' => 'Shift Pagi',

                'check_in' => '08:00:00',
                'check_out' => '17:00:00',

                'checkin_time' => '08:00:00',
                'checkout_time' => '17:00:00',

                'toleransi_late' => 15,
                'late_minutes' => 0,
                'total_waktu' => 540,

                'status_checkin' => 'checked_in',
                'status_checkout' => 'checked_out',

                'status' => 'ontime',

                'late_reason' => null,
                'late_proof' => null,
                'early_reason' => null,

                'statusAprv' => 'onTime',

                'latitude_checkin' => -7.250445,
                'longitude_checkin' => 112.768845,
                'distance_checkin' => 10.50,

                'latitude_checkout' => -7.250445,
                'longitude_checkout' => 112.768845,
                'distance_checkout' => 12.30,

                'device' => 'Seeder',

                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}