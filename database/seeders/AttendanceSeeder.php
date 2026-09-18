<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        Attendance::create([
            'employee_id' => 80,

            'gambar_checkin' => null,
            'gambar_checkout' => null,

            'tanggal' => '2026-09-14',
            'name_shift' => 'Normal',

            'check_in' => '08:01:00',
            'check_out' => null,

            'checkin_time' => '08:03:00',
            'checkout_time' => '17:00:00',

            'toleransi_late' => 5,
            'late_minutes' => 2,
            'total_waktu' => 0,

            'status_checkin' => 'Terlambat Dengan Toleransi - Luar Jangkauan',
            'status_checkout' => null,

            'status' => 'ontime',

            'late_reason' => null,
            'late_proof' => null,
            'early_reason' => null,

            'statusAprv' => 'onTime',

            'latitude_checkin' => -7.8165449,
            'longitude_checkin' => 111.9892214,
            'distance_checkin' => 10831.01,

            'latitude_checkout' => null,
            'longitude_checkout' => null,
            'distance_checkout' => null,

            'device' => 'Android',

            'created_at' => '2026-09-11 08:00:00',
            'updated_at' => '2026-09-11 17:00:00',
        ]);
    }
}