<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\EmployeeWorkScheduleResource;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Shift;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkScheduleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $search = $request->get('search');
        $officeId = $request->get('office_id');

        $periodStart = Carbon::create($year, $month, 26)->subMonth();
        $periodEnd = $periodStart->copy()->addMonth()->day(25);

        $periodLabel = $periodStart->translatedFormat('d F') . ' - ' . $periodEnd->translatedFormat('d F Y');

        $periodDates = [];
        for ($date = $periodStart->copy(); $date <= $periodEnd; $date->addDay()) {
            $periodDates[] = [
                'date' => $date->toDateString(),
                'day' => $date->day,
                'month' => $date->month,
                'year' => $date->year,
                'day_name' => $date->translatedFormat('l'),
            ];
        }

        $employees = Employee::query()
            ->select('id', 'name', 'shift_id', 'office_id')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })
            ->when($officeId, function ($q) use ($officeId) {
                $q->where('office_id', $officeId);
            })
            ->with([
                'shift:id,name_shift',
                'workSchedules' => function ($q) use ($periodStart, $periodEnd) {
                    $q->select('id', 'employee_id', 'shift_id', 'start_date', 'end_date')
                        ->whereDate('start_date', $periodStart)
                        ->whereDate('end_date', $periodEnd)
                        ->with([
                            'workScheduleDays' => function ($q) {
                                $q->select('id', 'work_schedule_id', 'work_date', 'is_off', 'shift_id')
                                    ->with('shift:id,name_shift')
                                    ->orderBy('work_date');
                            },
                        ]);
                },
            ])
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('data-karyawan/jadwal-kerja/index', [
            'employees' => EmployeeWorkScheduleResource::collection($employees),
            'filters' => [
                'search' => $search,
                'office_id' => $officeId,
                'month' => (int) $month,
                'year' => (int) $year,
                'perPage' => (int) $perPage,
            ],
            'periodDates' => $periodDates,
            'periodLabel' => $periodLabel,
            'offices' => Office::select('id', 'name')->get(),
            'shifts' => Shift::select('id', 'name_shift')->get(),
        ]);
    }

    public function updateDay(Request $request, $id)
    {
        $day = WorkScheduleDay::with('workSchedule')->findOrFail($id);

        $scheduleDate = Carbon::parse($day->work_date);
        $startPeriod = Carbon::parse($day->workSchedule->start_date);
        $endPeriod = Carbon::parse($day->workSchedule->end_date);

        if ($scheduleDate->lt($startPeriod) || $scheduleDate->gt($endPeriod)) {
            return redirect()->back()->with('error', 'Tanggal di luar periode jadwal.');
        }

        $now = now();
        $currentStart = Carbon::create($now->year, $now->month, 26)->subMonth();
        $currentEnd = $currentStart->copy()->addMonth()->day(25);

        if ($startPeriod->ne($currentStart) || $endPeriod->ne($currentEnd)) {
            return redirect()->back()->with('error', 'Tidak bisa mengubah periode yang sudah lewat.');
        }

        $data = $request->validate([
            'shift_id' => 'nullable|exists:shifts,id',
            'is_off' => 'boolean',
        ]);

        $day->update($data);

        return redirect()->route('workschedule.index')->with('success', 'Jadwal berhasil diperbarui');
    }

    // public function updateDay(Request $request, $id)
    // {
    //     $day = WorkScheduleDay::findOrFail($id);

    //     $scheduleDate = Carbon::parse($day->work_date);

    //     if ($scheduleDate->lt(now()->startOfDay())) {
    //         return redirect()->back()->with('error', 'Jadwal yang sudah lewat tidak bisa diubah.');
    //     }

    //     $data = $request->validate([
    //         'shift_id' => 'nullable|exists:shifts,id',
    //         'is_off' => 'boolean',
    //     ]);

    //     $day->update($data);

    //     return redirect()->route('workschedule.index')->with('success', 'Jadwal berhasil diperbarui');
    // }
}
