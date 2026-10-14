<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Overtime;
use App\Models\ShiftDetail;
use App\Models\WorkSchedule;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OvertimeController extends Controller
{
    public function myovertime(Request $request)
    {
        $user = $request->user();

        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found',
            ], 404);
        }

        $period = (int) $request->query(
            'period',
            Carbon::today()->day >= 26
                ? Carbon::today()->month
                : Carbon::today()->subMonth()->month
        );

        if ($period < 1 || $period > 12) {
            return response()->json([
                'success' => false,
                'message' => 'Periode tidak valid.',
            ], 422);
        }

        $today = Carbon::today();
        $year = $today->year;

        // Periode 12 pada Januari berarti Desember tahun sebelumnya
        if ($period == 12 && $today->month == 1) {
            $year--;
        }

        $periodStart = Carbon::create(
            $year,
            $period,
            26
        )->startOfDay();

        $periodEnd = $periodStart
            ->copy()
            ->addMonthNoOverflow()
            ->day(25)
            ->endOfDay();

        $overtimes = Overtime::with('overtimeRate')
            ->where('employee_id', $employee->id)
            ->whereBetween('date', [
                $periodStart->toDateString(),
                $periodEnd->toDateString(),
            ])
            ->orderBy('date', 'desc')
            ->get();

        $totalOvertimeMinutes = 0;

        $data = $overtimes->map(function ($item) use (&$totalOvertimeMinutes) {
            $totalMinutes = 0;

            if ($item->status === 'approved') {
                try {
                    $from = Carbon::parse($item->time_from);
                    $to = Carbon::parse($item->time_to);

                    $fromMinutes = ($from->hour * 60) + $from->minute;
                    $toMinutes = ($to->hour * 60) + $to->minute;

                    $totalMinutes = $toMinutes - $fromMinutes;

                    // Melewati tengah malam
                    if ($totalMinutes < 0) {
                        $totalMinutes += 24 * 60;
                    }

                    $totalOvertimeMinutes += $totalMinutes;
                } catch (\Throwable $e) {
                    $totalMinutes = 0;
                }
            }
            return [
                'id' => $item->id,
                'date' => Carbon::parse($item->date) ->format('Y-m-d'),
                'time_from' => Carbon::parse($item->time_from) ->format('H:i'),
                'time_to' => Carbon::parse($item->time_to) ->format('H:i'),
                'reason' => $item->reason,
                'status' => $item->status,
                'total_minutes' => $totalMinutes,
                'warna' => match ($item->status) {
                    'pending' => 0xffffc107,
                    'approved' => 0xff4caf50,
                    'rejected' => 0xfff44336,
                    default => 0xff9e9e9e,
                },
            ];
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Data lembur berhasil diambil',

            'period' => [
                'value' => $period,
                'start' => $periodStart->format('Y-m-d'),
                'end' => $periodEnd->format('Y-m-d'),
                'total_overtime_minutes' => $totalOvertimeMinutes,
            ],

            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'time_from' => 'required',
            'time_to' => 'required|after:time_from',
            'reason' => 'required|string|max:255',
        ]);

        $employee = $request->user()->employees;

        if (!$employee) {
            return response()->json(
                [
                    'message' => 'Data employee tidak ditemukan',
                ],
                422,
            );
        }

        $employeeId = $employee->id;

        $timezone = $employee->office?->timezone ?? 'Asia/Jakarta';
        $date = Carbon::parse($request->date, $timezone);

        $timeFromDateTime = Carbon::parse(
            $date->toDateString() . ' ' . $request->time_from,
            $timezone
        );
        $timeToDateTime = Carbon::parse(
            $date->toDateString() . ' ' . $request->time_to,
            $timezone
        );

        $exists = Overtime::query()->where('employee_id', $employeeId)
            ->where('date', $date->toDateString())
            ->where(function ($q) use ($request) {
                $q->where('time_from', '<', $request->time_to)
                    ->where('time_to', '>', $request->time_from);
            })
            ->exists();

        if ($exists) {
            return response()->json(
                [
                    'message' => 'Sudah ada lembur di jam tersebut',
                ],
                422,
            );
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

        $dayName = $dayMap[$date->format('l')];

        $shiftDetail = ShiftDetail::where('shift_id', $employee->shift_id)->where('day_of_week', $dayName)->first();

        if (!$shiftDetail || !$shiftDetail->checkin_time || !$shiftDetail->checkout_time) {
            return response()->json(
                [
                    'message' => 'Shift atau jam pulang tidak ditemukan',
                ],
                422,
            );
        }

        $checkinDateTime = Carbon::parse(
            $date->toDateString() . ' ' . $shiftDetail->checkin_time,
            $timezone
        );
        $checkoutDateTime = Carbon::parse(
            $date->toDateString() . ' ' . $shiftDetail->checkout_time,
            $timezone
        );

        if ($checkoutDateTime->lte($checkinDateTime)) {
            $checkoutDateTime->addDay();
        }

        $isInsideWorkTime =
            $timeFromDateTime->lt($checkoutDateTime) &&
            $timeToDateTime->gt($checkinDateTime);

        if ($isInsideWorkTime) {
            return response()->json([
                'message' => 'Lembur tidak boleh di jam kerja',
            ], 422);
        }

        $workSchedule = WorkSchedule::where('employee_id', $employeeId)
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->first();

        if (!$workSchedule) {
            return response()->json(
                [
                    'message' => 'Jadwal kerja tidak ditemukan',
                ],
                422,
            );
        }

        $overtimeRateId = 1;

        $scheduleDay = WorkScheduleDay::where('work_schedule_id', $workSchedule->id)
            ->where('work_date', $date->toDateString())
            ->first();

        if ($scheduleDay && $scheduleDay->is_off) {
            $overtimeRateId = 2;
        }

        $overtime = Overtime::create([
            'employee_id' => $employeeId,
            'overtime_rate_id' => $overtimeRateId,
            'date' => $date->toDateString(),
            'time_from' => $request->time_from,
            'time_to' => $request->time_to,
            'reason' => $request->reason,
            'status' => 'pending',
            'is_paid' => true,
        ]);

        return response()->json(
            [
                'message' => 'Pengajuan lembur berhasil',
                'data' => $overtime,
            ],
            201,
        );
    }
}
