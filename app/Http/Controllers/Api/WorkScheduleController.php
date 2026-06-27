<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WorkScheduleController extends Controller
{
    public function mycalendar(Request $request)
    {
        $user = $request->user();

        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(
                [
                    'message' => 'Employee not found',
                ],
                404,
            );
        }

        $year = (int) ($request->year ?? now()->year);
        $month = (int) ($request->month ?? now()->month);

        $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
        $monthEnd = Carbon::create($year, $month, 1)->endOfMonth();

        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('tanggal', [$monthStart, $monthEnd])
            ->get()
            ->map(function ($item) {
                $status = trim(explode('-', $item->status_checkin)[0]);

                return [
                    'date' => Carbon::parse($item->tanggal)->toDateString(),
                    'type' => 'history',
                    'status' => $status,
                    'check_in' => $item->check_in ? Carbon::parse($item->check_in)->format('H:i') : '--:--',
                    'check_out' => $item->check_out ? Carbon::parse($item->check_out)->format('H:i') : '--:--',
                    'total_waktu' => $this->formatMenit($item->total_waktu),
                    'warna' => $this->mapWarna($status),
                ];
            });

        $approvedLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where(function ($q) use ($monthStart, $monthEnd) {
                $q->whereBetween('start_date', [$monthStart, $monthEnd])
                    ->orWhereBetween('end_date', [$monthStart, $monthEnd])
                    ->orWhere(function ($qq) use ($monthStart, $monthEnd) {
                        $qq->where('start_date', '<=', $monthStart)
                            ->where('end_date', '>=', $monthEnd);
                    });
            })
            ->get();
        $leaveDates = collect();

        foreach ($approvedLeaves as $leave) {
            $period = Carbon::parse($leave->start_date);
            while ($period->lte(Carbon::parse($leave->end_date))) {
                $leaveDates->push([
                    'date' => $period->toDateString(),
                    'type' => 'leave',
                    'status' => 'Cuti',
                    'check_in' => '--:--',
                    'check_out' => '--:--',
                    'total_waktu' => 'Cuti',
                    'warna' => 0xff4caf50, // hijau
                ]);
                $period->addDay();
            }
        }
        $leaveDates = $leaveDates->keyBy('date');

        $schedules = WorkSchedule::query()
            ->with([
                'workScheduleDays' => function ($q) use ($monthStart, $monthEnd) {
                    $q->whereBetween('work_date', [$monthStart, $monthEnd])
                        ->select('id', 'work_schedule_id', 'shift_id', 'work_date', 'is_off')
                        ->with([
                            'shift' => function ($q) {
                                $q->select('id', 'name_shift')->with([
                                    'shiftDetails' => function ($q) {
                                        $q->select('id', 'shift_id', 'day_of_week', 'checkin_time', 'checkout_time');
                                    },
                                ]);
                            },
                        ]);
                },
            ])
            ->where('employee_id', $employee->id)
            ->where(function ($q) use ($monthStart, $monthEnd) {
                $q->whereDate('start_date', '<=', $monthEnd)->whereDate('end_date', '>=', $monthStart);
            })
            ->get();

        $scheduleData = collect();
        $daysMap = [
            'monday' => 'senin',
            'tuesday' => 'selasa',
            'wednesday' => 'rabu',
            'thursday' => 'kamis',
            'friday' => 'jumat',
            'saturday' => 'sabtu',
            'sunday' => 'minggu',
        ];
        foreach ($schedules as $schedule) {
            $mapped = $schedule->workScheduleDays->map(function ($day) use ($daysMap) {
                $date = Carbon::parse($day->work_date);

                $dayName = $daysMap[strtolower($date->format('l'))];

                $shiftDetail = optional($day->shift)->shiftDetails?->where('day_of_week', $dayName)->first();

                $checkIn =
                    $shiftDetail && $shiftDetail->checkin_time
                    ? Carbon::parse($shiftDetail->checkin_time)->format('H:i')
                    : '--:--';

                $checkOut =
                    $shiftDetail && $shiftDetail->checkout_time
                    ? Carbon::parse($shiftDetail->checkout_time)->format('H:i')
                    : '--:--';

                return [
                    'date' => $date->toDateString(),
                    'type' => 'schedule',
                    'status' => $day->is_off ? 'Libur' : $day->shift->name_shift ?? '-',
                    'check_in' => $day->is_off ? '--:--' : $checkIn,
                    'check_out' => $day->is_off ? '--:--' : $checkOut,
                    'total_waktu' => $day->is_off ? 'Libur' : $day->shift->name_shift ?? '-',
                    'warna' => $day->is_off ? 0xff9e9e9e : 0xff000000,
                ];
            });

            $scheduleData = $scheduleData->merge($mapped);
        }

        $today = Carbon::today()->toDateString();
        $final = collect();

        foreach ($scheduleData as $s) {
            $date = $s['date'];

            if ($leaveDates->has($date)) {
                $final->push($leaveDates[$date]);
                continue;
            }

            $historyItem = $attendances->firstWhere('date', $date);

            if ($historyItem) {
                $final->push($historyItem);
                continue;
            }

            if ($date === $today) {
                $attendanceToday = Attendance::where('employee_id', $employee->id)->whereDate('tanggal', $today)->first();

                if ($attendanceToday) {
                    $status = trim(explode('-', $attendanceToday->status_checkin)[0]);

                    $checkIn = $attendanceToday->check_in
                        ? Carbon::parse($attendanceToday->check_in)->format('H:i')
                        : '--:--';

                    $checkOut = $attendanceToday->check_out
                        ? Carbon::parse($attendanceToday->check_out)->format('H:i')
                        : '--:--';

                    $total = $attendanceToday->check_out ? $this->formatMenit($attendanceToday->total_waktu) : '--:--';

                    $final->push([
                        'date' => $today,
                        'type' => 'history',
                        'status' => $status,
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'total_waktu' => $total,
                        'warna' => $this->mapWarna($status),
                    ]);
                } else {
                    if (strtolower($s['status']) === 'libur') {
                        $final->push($s);
                    } else {
                        $final->push([
                            'date' => $today,
                            'type' => 'today',
                            'status' => 'Belum Absen',
                            'check_in' => '--:--',
                            'check_out' => '--:--',
                            'total_waktu' => '--:--',
                            'warna' => 0xffffffff,
                        ]);
                    }
                }

                continue;
            }

            if ($date < $today) {
                if (strtolower($s['status']) === 'libur') {
                    $final->push($s);
                } else {
                    $final->push([
                        'date' => $date,
                        'type' => 'history',
                        'status' => 'Tidak Hadir',
                        'check_in' => '--:--',
                        'check_out' => '--:--',
                        'total_waktu' => '--:--',
                        'warna' => $this->mapWarna('Tidak Hadir'),
                    ]);
                }

                continue;
            }

            $final->push($s);
        }

        $final = $final->unique('date')->sortBy('date')->values();

        return response()->json([
            'data' => $final,
        ]);
    }

    private function formatMenit($menit)
    {
        if (!$menit) {
            return '--:--';
        }

        $jam = floor($menit / 60);
        $sisa = $menit % 60;

        return sprintf('%02d:%02d', $jam, $sisa);
    }

    private function mapWarna($status)
    {
        return match ($status) {
            'Tepat Waktu' => 0xff2196f3,
            'Terlambat Dengan Toleransi' => 0xffffc107,
            'Terlambat Tanpa Toleransi' => 0xfff44336,
            'Tidak Hadir' => 0xff9e9e9e,
            'Cuti' => 0xff4caf50,
            default => 0xff9e9e9e,
        };
    }
}
// <?php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Attendance;
// use App\Models\Employee;
// use App\Models\WorkSchedule;
// use Carbon\Carbon;
// use Illuminate\Http\Request;

// class WorkScheduleController extends Controller
// {
//     public function mycalendar(Request $request)
//     {
//         $user = $request->user();

//         $employee = Employee::where('user_id', $user->id)->first();

//         if (!$employee) {
//             return response()->json(
//                 [
//                     'message' => 'Employee not found',
//                 ],
//                 404,
//             );
//         }

//         $year = (int) ($request->year ?? now()->year);
//         $month = (int) ($request->month ?? now()->month);

//         $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
//         $monthEnd = Carbon::create($year, $month, 1)->endOfMonth();

//         $attendances = Attendance::where('employee_id', $employee->id)
//             ->whereBetween('tanggal', [$monthStart, $monthEnd])
//             ->get()
//             ->map(function ($item) {
//                 $status = trim(explode('-', $item->status_checkin)[0]);

//                 return [
//                     'date' => Carbon::parse($item->tanggal)->toDateString(),
//                     'type' => 'history',
//                     'status' => $status,
//                     'check_in' => $item->check_in ? Carbon::parse($item->check_in)->format('H:i') : '--:--',
//                     'check_out' => $item->check_out ? Carbon::parse($item->check_out)->format('H:i') : '--:--',
//                     'total_waktu' => $this->formatMenit($item->total_waktu),
//                     'warna' => $this->mapWarna($status),
//                 ];
//             });

//         $schedules = WorkSchedule::query()

//             ->with([
//                 'workScheduleDays' => function ($q) use ($monthStart, $monthEnd) {
//                     $q->whereBetween('work_date', [$monthStart, $monthEnd])

//                         ->select('id', 'work_schedule_id', 'shift_id', 'work_date', 'is_off')
//                         ->with([
//                             'shift' => function ($q) {
//                                 $q->select('id', 'name_shift')->with([
//                                     'shiftDetails' => function ($q) {
//                                         $q->select('id', 'shift_id', 'day_of_week', 'checkin_time', 'checkout_time');
//                                     },
//                                 ]);
//                             },
//                         ]);
//                 },
//             ])
//             ->where('employee_id', $employee->id)
//             ->where(function ($q) use ($monthStart, $monthEnd) {
//                 $q->whereDate('start_date', '<=', $monthEnd)->whereDate('end_date', '>=', $monthStart);
//             })

//             ->get();

//         $scheduleData = collect();

//         $daysMap = [
//             'monday' => 'senin',
//             'tuesday' => 'selasa',
//             'wednesday' => 'rabu',
//             'thursday' => 'kamis',
//             'friday' => 'jumat',
//             'saturday' => 'sabtu',
//             'sunday' => 'minggu',
//         ];

//         foreach ($schedules as $schedule) {
//             $mapped = $schedule->workScheduleDays->map(function ($day) use ($daysMap) {
//                 $date = Carbon::parse($day->work_date);

//                 $dayName = $daysMap[strtolower($date->format('l'))];

//                 $shiftDetail = optional($day->shift)->shiftDetails?->where('day_of_week', $dayName)->first();

//                 $checkIn =
//                     $shiftDetail && $shiftDetail->checkin_time
//                         ? Carbon::parse($shiftDetail->checkin_time)->format('H:i')
//                         : '--:--';

//                 $checkOut =
//                     $shiftDetail && $shiftDetail->checkout_time
//                         ? Carbon::parse($shiftDetail->checkout_time)->format('H:i')
//                         : '--:--';

//                 return [
//                     'date' => $date->toDateString(),
//                     'type' => 'schedule',
//                     'status' => $day->is_off ? 'Libur' : $day->shift->name_shift ?? '-',
//                     'check_in' => $day->is_off ? '--:--' : $checkIn,
//                     'check_out' => $day->is_off ? '--:--' : $checkOut,
//                     'total_waktu' => $day->is_off ? 'Libur' : $day->shift->name_shift ?? '-',
//                     'warna' => $day->is_off ? 0xff9e9e9e : 0xff000000,
//                 ];
//             });

//             $scheduleData = $scheduleData->merge($mapped);
//         }

//         $today = Carbon::today()->toDateString();

//         $final = collect();

//         foreach ($scheduleData as $s) {
//             $date = $s['date'];

//             $historyItem = $attendances->firstWhere('date', $date);

//             if ($historyItem) {
//                 $final->push($historyItem);
//                 continue;
//             }

//             if ($date === $today) {
//                 $attendanceToday = Attendance::where('employee_id', $employee->id)->whereDate('tanggal', $today)->first();

//                 if ($attendanceToday) {
//                     $status = trim(explode('-', $attendanceToday->status_checkin)[0]);

//                     $checkIn = $attendanceToday->check_in
//                         ? Carbon::parse($attendanceToday->check_in)->format('H:i')
//                         : '--:--';

//                     $checkOut = $attendanceToday->check_out
//                         ? Carbon::parse($attendanceToday->check_out)->format('H:i')
//                         : '--:--';

//                     $total = $attendanceToday->check_out ? $this->formatMenit($attendanceToday->total_waktu) : '--:--';

//                     $final->push([
//                         'date' => $today,
//                         'type' => 'history',
//                         'status' => $status,
//                         'check_in' => $checkIn,
//                         'check_out' => $checkOut,
//                         'total_waktu' => $total,
//                         'warna' => $this->mapWarna($status),
//                     ]);
//                 } else {
//                     if (strtolower($s['status']) === 'libur') {
//                         $final->push($s);
//                     } else {
//                         $final->push([
//                             'date' => $today,
//                             'type' => 'today',
//                             'status' => 'Belum Absen',
//                             'check_in' => '--:--',
//                             'check_out' => '--:--',
//                             'total_waktu' => '--:--',
//                             'warna' => 0xffffffff,
//                         ]);
//                     }
//                 }

//                 continue;
//             }

//             if ($date < $today) {
//                 if (strtolower($s['status']) === 'libur') {
//                     $final->push($s);
//                 } else {
//                     $final->push([
//                         'date' => $date,
//                         'type' => 'history',
//                         'status' => 'Tidak Hadir',
//                         'check_in' => '--:--',
//                         'check_out' => '--:--',
//                         'total_waktu' => '--:--',
//                         'warna' => $this->mapWarna('Tidak Hadir'),
//                     ]);
//                 }

//                 continue;
//             }

//             $final->push($s);
//         }

//         $final = $final->unique('date')->sortBy('date')->values();

//         return response()->json([
//             'data' => $final,
//         ]);
//     }

//     private function formatMenit($menit)
//     {
//         if (!$menit) {
//             return '--:--';
//         }

//         $jam = floor($menit / 60);
//         $sisa = $menit % 60;

//         return sprintf('%02d:%02d', $jam, $sisa);
//     }

//     private function mapWarna($status)
//     {
//         return match ($status) {
//             'Tepat Waktu' => 0xff2196f3,
//             'Terlambat Dengan Toleransi' => 0xffffc107,
//             'Terlambat Tanpa Toleransi' => 0xfff44336,
//             'Tidak Hadir' => 0xff9e9e9e,
//             default => 0xff9e9e9e,
//         };
//     }
// }
