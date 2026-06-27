<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\AssignShiftResource;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Shift;
use App\Models\WorkSchedule;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssignShiftController extends Controller
{
    public function edit(Request $request, Shift $shift)
    {
        $perPage = $request->get('perPage', 10);

        $employees = Employee::with(['office:id,name'])
            ->with(['workScheduleCurrentMonth.shift:id,name_shift'])
            ->when($request->office_id, function ($q) use ($request) {
                $q->where('office_id', $request->office_id);
            })
            ->when($request->name, function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->name . '%');
            })
            ->select('id', 'name', 'office_id', 'shift_id')
            ->paginate($perPage)
            ->withQueryString();

        $now = Carbon::now();

        if ($now->day >= 26) {
            $startPeriod = $now->copy()->day(26);
            $endPeriod = $now->copy()->addMonth()->day(25);
        } else {
            $startPeriod = $now->copy()->subMonth()->day(26);
            $endPeriod = $now->copy()->day(25);
        }

        $currentPeriod = sprintf('%s - %s', $startPeriod->translatedFormat('d F Y'), $endPeriod->translatedFormat('d F Y'));

        return Inertia::render('data-karyawan/shift-karyawan/assignEmployees', [
            'shift' => $shift,
            'employees' => AssignShiftResource::collection($employees)->response()->getData(true),
            'offices' => Office::select('id', 'name')->orderBy('name')->get(),
            'currentPeriod' => $currentPeriod,
            'filters' => [
                'office_id' => $request->office_id,
                'name' => $request->name,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function patch(Request $request, Shift $shift)
    {
        $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',

            'use_custom_date' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $today = now();

        if ($today->day >= 26) {
            $startDate = Carbon::create($today->year, $today->month, 26);
        } else {
            $startDate = Carbon::create($today->year, $today->month, 26)->subMonth();
        }

        $endDate = $startDate->copy()->addMonth()->day(25);


        DB::transaction(function () use ($request, $shift, $startDate, $endDate) {
            Employee::whereIn('id', $request->employee_ids)->update([
                'shift_id' => $shift->id,
            ]);

            $dayNameMap = [
                'monday' => 'senin',
                'tuesday' => 'selasa',
                'wednesday' => 'rabu',
                'thursday' => 'kamis',
                'friday' => 'jumat',
                'saturday' => 'sabtu',
                'sunday' => 'minggu',
            ];

            $shiftDetails = $shift->shiftDetails->keyBy(function ($item) {
                return strtolower($item->day_of_week);
            });

            foreach ($request->employee_ids as $employeeId) {
                $workSchedule = WorkSchedule::updateOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'start_date' => $startDate->toDateString(),
                        'end_date' => $endDate->toDateString(),
                    ],
                    [
                        'shift_id' => $shift->id,
                    ],
                );

                $workSchedule->workScheduleDays()->delete();

                $totalWorkDays = 0;
                $totalOffDays = 0;

                for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                    $dayName = $dayNameMap[strtolower($date->format('l'))];

                    $detail = $shiftDetails[$dayName] ?? null;

                    $isOff = !$detail || $detail->is_active == 0;

                    if ($isOff) {
                        $totalOffDays++;
                    } else {
                        $totalWorkDays++;
                    }

                    WorkScheduleDay::create([
                        'work_schedule_id' => $workSchedule->id,
                        'shift_id' => $isOff ? null : $shift->id,
                        'work_date' => $date->toDateString(),
                        'is_off' => $isOff,
                        'note' => null,
                    ]);
                }

                $workSchedule->update([
                    'total_work_days' => $totalWorkDays,
                    'total_off_days' => $totalOffDays,
                ]);
            }
        });

        return back()->with('success', 'Shift berhasil di-assign dan jadwal berhasil dibuat');
    }
    // public function patch(Request $request, Shift $shift)
    // {
    //     $request->validate([
    //         'employee_ids' => 'required|array',
    //         'employee_ids.*' => 'exists:employees,id',

    //         'use_custom_date' => 'nullable|boolean',
    //         'start_date' => 'nullable|date',
    //         'end_date' => 'nullable|date|after_or_equal:start_date',
    //     ]);

    //     $today = now();

    //     // if ($today->day <= 20) {
    //     //     return back()->with('error', 'Generate jadwal hanya bisa dilakukan mulai tanggal 21');
    //     // }

    //     $startDate = Carbon::create($today->year, $today->month, 26);
    //     $endDate = $startDate->copy()->addMonth()->day(25);

    //     DB::transaction(function () use ($request, $shift, $startDate, $endDate) {
    //         Employee::whereIn('id', $request->employee_ids)->update([
    //             'shift_id' => $shift->id,
    //         ]);

    //         $dayNameMap = [
    //             'monday' => 'senin',
    //             'tuesday' => 'selasa',
    //             'wednesday' => 'rabu',
    //             'thursday' => 'kamis',
    //             'friday' => 'jumat',
    //             'saturday' => 'sabtu',
    //             'sunday' => 'minggu',
    //         ];

    //         $shiftDetails = $shift->shiftDetails->keyBy(function ($item) {
    //             return strtolower($item->day_of_week);
    //         });

    //         foreach ($request->employee_ids as $employeeId) {
    //             $workSchedule = WorkSchedule::updateOrCreate(
    //                 [
    //                     'employee_id' => $employeeId,
    //                     'start_date' => $startDate->toDateString(),
    //                     'end_date' => $endDate->toDateString(),
    //                 ],
    //                 [
    //                     'shift_id' => $shift->id,
    //                 ],
    //             );

    //             $workSchedule->workScheduleDays()->delete();

    //             $totalWorkDays = 0;
    //             $totalOffDays = 0;

    //             for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
    //                 $dayName = $dayNameMap[strtolower($date->format('l'))];

    //                 $detail = $shiftDetails[$dayName] ?? null;

    //                 $isOff = !$detail || $detail->is_active == 0;

    //                 if ($isOff) {
    //                     $totalOffDays++;
    //                 } else {
    //                     $totalWorkDays++;
    //                 }

    //                 WorkScheduleDay::create([
    //                     'work_schedule_id' => $workSchedule->id,

    //                     'shift_id' => $isOff ? null : $shift->id,

    //                     'work_date' => $date->toDateString(),

    //                     'is_off' => $isOff,

    //                     'note' => null,
    //                 ]);
    //             }

    //             $workSchedule->update([
    //                 'total_work_days' => $totalWorkDays,
    //                 'total_off_days' => $totalOffDays,
    //             ]);
    //         }
    //     });

    //     return back()->with('success', 'Shift berhasil di-assign dan jadwal berhasil dibuat');
    // }

}
