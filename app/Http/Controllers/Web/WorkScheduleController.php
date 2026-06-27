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

        $today = now();

        if ($today->day >= 26) {
            $month = $request->get('month', $today->month);
            $year = $request->get('year', $today->year);
        } else {
            $prev = $today->copy()->subMonth();
            $month = $request->get('month', $prev->month);
            $year = $request->get('year', $prev->year);
        }

        $search = $request->get('search');
        $officeId = $request->get('office_id');

        $periodStart = Carbon::create($year, $month, 26);
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
        // $currentStart = Carbon::create($now->year, $now->month, 26)->subMonth();
        // $currentEnd = $currentStart->copy()->addMonth()->day(25);

        // if ($startPeriod->ne($currentStart) || $endPeriod->ne($currentEnd)) 
        if ($now->lt($startPeriod) || $now->gt($endPeriod)) {
            return redirect()->back()->with('error', 'Tidak bisa mengubah periode yang sudah lewat.');
        }

        $data = $request->validate([
            'shift_id' => 'nullable|exists:shifts,id',
            'is_off' => 'boolean',
        ]);

        $day->update($data);

        return back()->with('success', 'Jadwal berhasil diperbarui');
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'office_id' => 'nullable|exists:offices,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'is_off' => 'required|boolean',
        ]);

        $date = Carbon::parse($data['date']);
        $now = now();

        $officeId = $request->input('office_id');

        $employees = Employee::query()
            ->when($officeId, fn($q) => $q->where('office_id', $officeId))
            ->pluck('id');

        $workScheduleDays = WorkScheduleDay::with('workSchedule')
            ->whereDate('work_date', $date)
            ->whereHas('workSchedule', function ($q) use ($employees) {
                $q->whereIn('employee_id', $employees);
            })
            ->get();

        $updated = 0;
        $skipped = 0;

        foreach ($workScheduleDays as $day) {
            $startPeriod = Carbon::parse($day->workSchedule->start_date);
            $endPeriod = Carbon::parse($day->workSchedule->end_date);

            if ($now->lt($startPeriod) || $now->gt($endPeriod)) {
                $skipped++;
                continue;
            }

            $day->update([
                'shift_id' => $data['is_off'] ? null : $data['shift_id'],
                'is_off' => $data['is_off'],
            ]);

            $updated++;
        }

        if ($updated === 0) {
            return back()->with('error', 'Tidak ada jadwal yang bisa diupdate (semua sudah lewat periode).');
        }

        return back()->with('success', "Bulk update berhasil. Updated: {$updated}, Skipped: {$skipped}");
    }
}
