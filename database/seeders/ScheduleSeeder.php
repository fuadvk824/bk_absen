<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $startDate = Carbon::create(2026, 3, 26);
        $endDate = Carbon::create(2026, 5, 14);

        $employees = DB::table('employees')->whereNotNull('shift_id')->select('id', 'shift_id')->get();

        foreach ($employees as $employee) {

            $schedules = DB::table('work_schedules')
                ->where('employee_id', $employee->id)
                ->whereDate('end_date', '>=', $startDate)
                ->whereDate('start_date', '<=', $endDate)
                ->orderBy('start_date')
                ->get();

            foreach ($schedules as $schedule) {
                $days = DB::table('work_schedule_days')
                    ->where('work_schedule_id', $schedule->id)
                    ->whereBetween('work_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->where('is_off', false)
                    ->orderBy('work_date')
                    ->get();

                foreach ($days as $day) {
                    $date = Carbon::parse($day->work_date);

                    $alreadyExists = DB::table('attendances')
                        ->where('employee_id', $employee->id)
                        ->whereDate('tanggal', $date)
                        ->exists();

                    if ($alreadyExists) {
                        continue;
                    }

                    if (!$day->shift_id) {
                        continue;
                    }

                    $shift = DB::table('shifts')->where('id', $day->shift_id)->first();

                    if (!$shift) {
                        continue;
                    }

                    $dayNameMap = [
                        'monday' => 'senin',
                        'tuesday' => 'selasa',
                        'wednesday' => 'rabu',
                        'thursday' => 'kamis',
                        'friday' => 'jumat',
                        'saturday' => 'sabtu',
                        'sunday' => 'minggu',
                    ];

                    $dayName = $dayNameMap[strtolower($date->format('l'))];

                    $shiftDetail = DB::table('shift_details')
                        ->where('shift_id', $shift->id)
                        ->where('day_of_week', $dayName)
                        ->where('is_active', true)
                        ->first();

                    if (!$shiftDetail || !$shiftDetail->checkin_time || !$shiftDetail->checkout_time) {
                        continue;
                    }

                    $this->insertAttendance(employee: $employee, date: $date, shift: $shift, shiftDetail: $shiftDetail);
                }
            }
        }
    }

    private function insertAttendance($employee, $date, $shift, $shiftDetail)
    {
        $tanggal = $date->toDateString();

        $checkinBase = Carbon::parse($tanggal . ' ' . $shiftDetail->checkin_time);

        $checkoutBase = Carbon::parse($tanggal . ' ' . $shiftDetail->checkout_time);

        if ($checkoutBase->lessThan($checkinBase)) {
            $checkoutBase->addDay();
        }

        $actualCheckin = $checkinBase->copy()->addMinutes(rand(-10, 30));
        $actualCheckout = $checkoutBase->copy()->addMinutes(rand(0, 20));

        $lateMinutes = 0;

        if ($actualCheckin->greaterThan($checkinBase)) {
            $lateMinutes = $checkinBase->diffInMinutes($actualCheckin);
        }

        $isLate = $lateMinutes > 0;

        $isWithinTolerance = $lateMinutes <= $shift->toleransi_late;
        $isDalamArea = rand(0, 1) === 1;

        if (!$isLate) {
            $statusCheckin = $isDalamArea ? 'Tepat Waktu - Dalam Area' : 'Tepat Waktu - Luar Area';
        } else {
            if ($isWithinTolerance && $isDalamArea) {
                $statusCheckin = 'Terlambat Dengan Toleransi - Dalam Area';
            } elseif ($isWithinTolerance && !$isDalamArea) {
                $statusCheckin = 'Terlambat Dengan Toleransi - Luar Area';
            } elseif (!$isWithinTolerance && $isDalamArea) {
                $statusCheckin = 'Terlambat Tanpa Toleransi - Dalam Area';
            } else {
                $statusCheckin = 'Terlambat Tanpa Toleransi - Luar Area';
            }
        }

        DB::table('attendances')->updateOrInsert(
            [
                'employee_id' => $employee->id,
                'tanggal' => $tanggal,
            ],

            [
                'name_shift' => $shift->name_shift,

                'check_in' => $actualCheckin,
                'check_out' => $actualCheckout,

                'checkin_time' => $shiftDetail->checkin_time,
                'checkout_time' => $shiftDetail->checkout_time,

                'toleransi_late' => $shift->toleransi_late,

                'late_minutes' => $lateMinutes,

                'total_waktu' => $actualCheckin->diffInMinutes($actualCheckout),

                'status_checkin' => $statusCheckin,

                'status_checkout' => 'sudah checkout',

                'status' => $isLate ? 'late' : 'ontime',

                'alasan_terlambat' => $isLate ? 'Kemacetan' : null,

                'device' => 'Android',

                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }
}
