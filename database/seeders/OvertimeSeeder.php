<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OvertimeSeeder extends Seeder
{
    public function run(): void
    {
        $employeeId = 1;

        $customDates = ['2026-02-27', '2026-03-09', '2026-03-16', '2026-03-20','2026-03-29', '2026-04-02', '2026-04-08', '2026-04-17', '2026-04-19'];
        $data = [];

        $employee = DB::table('employees')->where('id', $employeeId)->first();

        if (!$employee || !$employee->shift_id) {
            return;
        }

        foreach ($customDates as $date) {
            $carbonDate = Carbon::parse($date);

           

            $workScheduleDay = DB::table('work_schedule_days')->where('work_date', $date)->first();

            $isOff = $workScheduleDay?->is_off ?? false;

          

            $rateName = $isOff ? 'Hari Libur' : 'Hari Kerja';

            $overtimeRate = DB::table('overtime_rates')->where('name', $rateName)->where('is_active', true)->first();

            if (!$overtimeRate) {
                continue;
            }

        

            $dayMap = [
                'Monday' => 'senin',
                'Tuesday' => 'selasa',
                'Wednesday' => 'rabu',
                'Thursday' => 'kamis',
                'Friday' => 'jumat',
                'Saturday' => 'sabtu',
                'Sunday' => 'minggu',
            ];

            $dayName = $dayMap[$carbonDate->format('l')];

            $shiftDetail = DB::table('shift_details')
                ->where('shift_id', $employee->shift_id)
                ->where('day_of_week', $dayName)
                ->first();

            if (!$shiftDetail || !$shiftDetail->checkout_time) {
                continue;
            }

            $checkoutHour = Carbon::parse($shiftDetail->checkout_time);
            $timeFrom = $checkoutHour->copy()->addHours(rand(0, 2));
            $timeTo = $timeFrom->copy()->addHours(rand(1, 3));

            $data[] = [
                'employee_id' => $employeeId,
                'overtime_rate_id' => $overtimeRate->id,
                'date' => $date,
                'time_from' => $timeFrom->format('H:i:s'),
                'time_to' => $timeTo->format('H:i:s'),
                'reason' => 'Lembur menyelesaikan pekerjaan proyek',
                'status' => ['pending', 'approved', 'rejected'][rand(0, 2)],
                'is_paid' => rand(0, 1),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('overtimes')->insert($data);
    }

    
}
