<?php

namespace App\Http\Controllers\Web;

use App\Exports\AttendanceExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\Web\AttendanceResourcee;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Office;
use App\Models\Shift;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{
    // public function index(Request $request)
    // {
    //     return Inertia::render('coba/index');
    // }
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $attendances = Attendance::filter($request)
            ->with([
                'employee:id,name,office_id,department_id',
                'employee.office:id,name,latitude,longitude,radius_meter',
                'employee.department:id,name',
                'employee.shift:id,name_shift',
            ])

            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kehadiran/index', [
            'attendances' => AttendanceResourcee::collection($attendances)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'office_ids' => $request->office_ids,
                'department_id' => $request->department_id,
                'shift_id' => $request->shift_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'perPage' => $perPage,
            ],
            'offices' => Office::select('id', 'name')->get(),
            'departments' => Department::select('id', 'name')->get(),
            'shifts' => Shift::select('id', 'name_shift')->get(),
        ]);
    }

    public function approval(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'statusAprv' => 'required|in:approved,rejected',
        ]);

        if ($attendance->statusAprv !== 'pending') {
            return back()->with('error', 'Data sudah diproses sebelumnya');
        }

        $attendance->update([
            'statusAprv' => $validated['statusAprv'],
        ]);

        return back()->with('success', 'Status approval berhasil diperbarui');
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);

        return Excel::download(new AttendanceExport($request, $columns), 'attendance.xlsx');
    }
}
