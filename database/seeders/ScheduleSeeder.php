<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $startDate = Carbon::create(2026, 1, 26);
        $endDate = Carbon::create(2026, 2, 25);

        $employees = DB::table('employees')->whereNotNull('shift_id')->select('id', 'shift_id')->get();

        foreach ($employees as $employee) {

            $leaveDates = $this->getApprovedLeaveDates($employee->id);

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
                   
                    if (in_array($date->toDateString(), $leaveDates)) {
                        continue;
                    }

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

        if ($checkoutBase->lt($checkinBase)) {
            $checkoutBase->addDay();
        }

        $actualCheckin = $checkinBase->copy()->addMinutes(rand(-10, 30));
        $actualCheckout = $checkoutBase->copy()->addMinutes(rand(-20, 20));

        $lateMinutes = 0;

        if ($actualCheckin->gt($checkinBase)) {
            $lateMinutes = $checkinBase->diffInMinutes($actualCheckin);
        }

        $isLate = $lateMinutes > 0;

        $isWithinTolerance = $lateMinutes <= $shift->toleransi_late;

        // Simulasi area
        $isDalamArea = rand(0, 1);

        // Simulasi pulang cepat
        $earlyReason = null;

        if ($actualCheckout->lt($checkoutBase)) {
            $earlyReason = collect([
                'Ada keperluan keluarga',
                'Sakit',
                'Izin atasan',
                'Urusan pribadi',
            ])->random();
        }

        if (!$isLate) {
            $statusCheckin = $isDalamArea
                ? 'Tepat Waktu - Dalam Area'
                : 'Tepat Waktu - Luar Area';

            $statusAprv = 'onTime';
        } else {

            if ($isWithinTolerance && $isDalamArea) {
                $statusCheckin = 'Terlambat Dengan Toleransi - Dalam Area';
            } elseif ($isWithinTolerance) {
                $statusCheckin = 'Terlambat Dengan Toleransi - Luar Area';
            } elseif ($isDalamArea) {
                $statusCheckin = 'Terlambat Tanpa Toleransi - Dalam Area';
            } else {
                $statusCheckin = 'Terlambat Tanpa Toleransi - Luar Area';
            }

            $statusAprv = collect([
                'approved',
                'pending',
                'rejected',
            ])->random();
        }

        // Simulasi lokasi Surabaya
        $latCheckin = -7.2575 + (rand(-500, 500) / 100000);
        $lngCheckin = 112.7521 + (rand(-500, 500) / 100000);

        $latCheckout = -7.2575 + (rand(-500, 500) / 100000);
        $lngCheckout = 112.7521 + (rand(-500, 500) / 100000);

        DB::table('attendances')->updateOrInsert(
            [
                'employee_id' => $employee->id,
                'tanggal' => $tanggal,
            ],
            [
                'name_shift' => $shift->name_shift,

                'check_in' => $actualCheckin->format('H:i:s'),
                'check_out' => $actualCheckout->format('H:i:s'),

                'checkin_time' => $shiftDetail->checkin_time,
                'checkout_time' => $shiftDetail->checkout_time,

                'toleransi_late' => $shift->toleransi_late,
                'late_minutes' => $lateMinutes,

                'total_waktu' => $actualCheckin->diffInMinutes($actualCheckout),

                'status_checkin' => $statusCheckin,
                'status_checkout' => 'sudah checkout',

                'status' => $isLate ? 'late' : 'ontime',

                'late_reason' => $isLate
                    ? collect([
                        'Kemacetan',
                        'Kendaraan mogok',
                        'Cuaca buruk',
                        'Keperluan mendadak',
                    ])->random()
                    : null,

                'late_proof' => $isLate
                    ? 'late-proof-' . rand(1000, 9999) . '.jpg'
                    : null,

                'early_reason' => $earlyReason,

                'statusAprv' => $statusAprv,

                'gambar_checkin' => 'checkin-default.jpg',
                'gambar_checkout' => 'checkout-default.jpg',

                'latitude_checkin' => $latCheckin,
                'longitude_checkin' => $lngCheckin,
                'distance_checkin' => rand(0, 300),

                'latitude_checkout' => $latCheckout,
                'longitude_checkout' => $lngCheckout,
                'distance_checkout' => rand(0, 300),

                'device' => collect([
                    'Android',
                    'iPhone',
                    'Web',
                ])->random(),

                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    private function getApprovedLeaveDates(int $employeeId): array
    {
        $dates = [];

        $leaves = DB::table('leaves')
            ->where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->get();

        foreach ($leaves as $leave) {

            $current = Carbon::parse($leave->start_date);
            $end = Carbon::parse($leave->end_date);

            while ($current->lte($end)) {
                $dates[] = $current->toDateString();
                $current->addDay();
            }
        }

        return $dates;
    }
}
