<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shiftPagiId = DB::table('shifts')->insertGetId([
            'shift_code'      => 'SHF001A',
            'name_shift'      => 'Normal',
            'toleransi_late'  => 3,
            'denda_alpha'     => 0,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $this->insertShiftDetails(
            $shiftPagiId,
            '08:00:00',
            '17:00:00',
            '12:00:00',
            '13:00:00'
        );

        $shiftSiangId = DB::table('shifts')->insertGetId([
            'shift_code'      => 'SHF002A',
            'name_shift'      => 'Ramadhan',
            'toleransi_late'  => 10,
            'denda_alpha'     => 100000,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $this->insertShiftDetails(
            $shiftSiangId,
            '08:00:00',
            '16:00:00',
            '12:00:00',
            '13:00:00'
        );

        $shiftMalamId = DB::table('shifts')->insertGetId([
            'shift_code'      => 'SHF003A',
            'name_shift'      => 'Half',
            'toleransi_late'  => 5,
            'denda_alpha'     => 50000,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $this->insertShiftDetails(
            $shiftMalamId,
            '08:00:00',
            '12:00:00',
            null,
            null
        );
    }


    private function insertShiftDetails($shiftId, $checkin, $checkout, $breakStart, $breakEnd)
    {
        $days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

        foreach ($days as $day) {
            DB::table('shift_details')->insert([
                'shift_id'        => $shiftId,
                'day_of_week'     => $day,
                'checkin_time'    => $checkin,
                'checkout_time'   => $checkout,
                'breaktime_start' => $breakStart,
                'breaktime_end'   => $breakEnd,
                'is_active'       => in_array($day, ['senin','selasa','rabu','kamis','jumat', 'sabtu', 'minggu']),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }
}