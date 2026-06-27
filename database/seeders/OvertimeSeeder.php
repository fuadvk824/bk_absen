<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OvertimeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = DB::table('employees')
            ->whereNotNull('shift_id')
            ->get();

        $data = [];

        $dayMap = [
            'Monday' => 'senin',
            'Tuesday' => 'selasa',
            'Wednesday' => 'rabu',
            'Thursday' => 'kamis',
            'Friday' => 'jumat',
            'Saturday' => 'sabtu',
            'Sunday' => 'minggu',
        ];

        foreach ($employees as $employee) {

            // Setiap employee punya 3-10 data lembur
            $totalOvertime = rand(3, 10);

            for ($i = 0; $i < $totalOvertime; $i++) {

                // Random tanggal antara Februari - April 2026
                $date = Carbon::create(2026, 2, 1)
                    ->addDays(rand(0, 88))
                    ->format('Y-m-d');

                $carbonDate = Carbon::parse($date);

                $workScheduleDay = DB::table('work_schedule_days')
                    ->where('work_date', $date)
                    ->first();

                $isOff = $workScheduleDay?->is_off ?? false;

                $rateName = $isOff ? 'Hari Libur' : 'Hari Kerja';

                $overtimeRate = DB::table('overtime_rates')
                    ->where('name', $rateName)
                    ->where('is_active', true)
                    ->first();

                if (!$overtimeRate) {
                    continue;
                }

                $dayName = $dayMap[$carbonDate->format('l')];

                $shiftDetail = DB::table('shift_details')
                    ->where('shift_id', $employee->shift_id)
                    ->where('day_of_week', $dayName)
                    ->first();

                if (!$shiftDetail || !$shiftDetail->checkout_time) {
                    continue;
                }

                $checkoutTime = Carbon::parse($shiftDetail->checkout_time);

                // Mulai lembur 0-2 jam setelah pulang kerja
                $timeFrom = $checkoutTime->copy()->addMinutes(rand(0, 120));

                // Durasi lembur 1-4 jam
                $timeTo = $timeFrom->copy()->addMinutes(rand(60, 240));

                $statuses = ['pending', 'approved', 'rejected'];

                $data[] = [
                    'employee_id' => $employee->id,
                    'overtime_rate_id' => $overtimeRate->id,
                    'date' => $date,
                    'time_from' => $timeFrom->format('H:i:s'),
                    'time_to' => $timeTo->format('H:i:s'),
                    'reason' => collect([
                        'Menyelesaikan pekerjaan proyek',
                        'Perbaikan bug aplikasi',
                        'Deployment sistem',
                        'Penyusunan laporan bulanan',
                        'Maintenance server',
                        'Persiapan presentasi klien',
                    ])->random(),
                    'status' => $statuses[array_rand($statuses)],
                    'is_paid' => rand(0, 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('overtimes')->insert($data);
    }
}