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
        $employee = Employee::query()->where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(
                [
                    'message' => 'Employee not found',
                ],
                404,
            );
        }

        $overtimes = Overtime::with('overtimeRate')
            ->where('employee_id', $employee->id)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'date' => Carbon::parse($item->date)->format('Y-m-d'),
                    'time_from' => Carbon::parse($item->time_from)->format('H:i'),
                    'time_to' => Carbon::parse($item->time_to)->format('H:i'),
                    'reason' => $item->reason,
                    'status' => $item->status,

                    'warna' => match ($item->status) {
                        'pending' => 0xffffc107,
                        'approved' => 0xff4caf50,
                        'rejected' => 0xfff44336,
                        default => 0xff9e9e9e,
                    },
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Data overtime berhasil diambil',
            'data' => $overtimes,
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

        $date = Carbon::parse($request->date);

        //////////////////////////////////////////////////////////
        // if ($date->lt($now->copy()->startOfDay())) {
        //     return response()->json([
        //         'message' => 'Tanggal pengajuan sudah lewat',
        //     ], 422);
        // }
        $timeFromDateTime = Carbon::parse($date->toDateString() . ' ' . $request->time_from);
        $timeToDateTime   = Carbon::parse($date->toDateString() . ' ' . $request->time_to);

        ///////////////////////////////////////////////

        $exists = Overtime::where('employee_id', $employeeId)
            ->where('date', $request->date)
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

        $checkinDateTime = Carbon::parse($date->toDateString() . ' ' . $shiftDetail->checkin_time);
        $checkoutDateTime = Carbon::parse($date->toDateString() . ' ' . $shiftDetail->checkout_time);

        // handle shift lintas hari (contoh: 22:00 - 06:00)
        if ($checkoutDateTime->lte($checkinDateTime)) {
            $checkoutDateTime->addDay();
        }

        // $timeFromDateTime = Carbon::parse($date->toDateString() . ' ' . $request->time_from);
        // $timeToDateTime = Carbon::parse($date->toDateString() . ' ' . $request->time_to);

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
            'date' => $request->date,
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
