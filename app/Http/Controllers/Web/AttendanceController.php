<?php

namespace App\Http\Controllers\Web;

use App\Exports\AttendanceExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\Web\AttendanceResourcee;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Office;
use App\Models\Shift;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Employee;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{

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

            ->orderByDesc('tanggal')
            ->orderByDesc('check_in')
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
    public function create()
    {
        $employees = Employee::query()
            ->with([
                'office:id,name,latitude,longitude,radius_meter',
                'shift:id,name_shift,toleransi_late',
            ])
            ->select('id', 'employee_code', 'name', 'office_id', 'shift_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('kehadiran/create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'tanggal' => ['required', 'date'],
            'check_in' => ['required', 'date_format:H:i'],
            'latitude_checkin' => ['required', 'numeric', 'between:-90,90'],
            'longitude_checkin' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $employee = Employee::with([
            'office',
            'shift',
        ])->findOrFail($validated['employee_id']);

        if (!$employee->office) {
            throw ValidationException::withMessages([
                'employee_id' => 'Karyawan belum memiliki kantor.',
            ]);
        }

        $office = $employee->office;

        if ($office->latitude === null || $office->longitude === null) {
            throw ValidationException::withMessages([
                'latitude_checkin' => 'Koordinat kantor belum tersedia.',
            ]);
        }

        // Cegah attendance ganda untuk karyawan dan tanggal yang sama.
        $exists = Attendance::where(
            'employee_id',
            $employee->id
        )->whereDate('tanggal', $validated['tanggal'])->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'tanggal' => 'Attendance karyawan pada tanggal tersebut sudah ada.',
            ]);
        }

        // Hitung jarak antara titik check-in dan koordinat kantor.
        $earthRadius = 6371000;

        $lat1 = deg2rad((float) $office->latitude);
        $lat2 = deg2rad((float) $validated['latitude_checkin']);

        $deltaLat = deg2rad(
            (float) $validated['latitude_checkin']
                - (float) $office->latitude
        );

        $deltaLng = deg2rad(
            (float) $validated['longitude_checkin']
                - (float) $office->longitude
        );

        $a = sin($deltaLat / 2) ** 2
            + cos($lat1) * cos($lat2)
            * sin($deltaLng / 2) ** 2;

        $distance = $earthRadius * 2 * atan2(
            sqrt($a),
            sqrt(1 - $a)
        );

        $radius = (float) ($office->radius_meter ?? 0);

        $checkIn = $validated['check_in'];
        $shift = $employee->shift;

        $tolerance = (int) ($shift?->toleransi_late ?? 0);

        /*
     * Status awal berdasarkan waktu aktual.
     * Jika jadwal shift tersedia, bandingkan dengan checkin_time.
     */
        $status = 'ontime';
        $statusCheckin = $distance <= $radius
            ? 'Tepat Waktu - Dalam Jangkauan'
            : 'Tepat Waktu - Luar Jangkauan';

        $attendance = DB::transaction(function () use (
            $validated,
            $employee,
            $shift,
            $checkIn,
            $tolerance,
            $distance,
            $radius,
            &$status,
            &$statusCheckin
        ) {
            // Ambil jadwal shift sesuai hari yang dipilih.
            $dayOfWeek = strtolower(
                Carbon::parse($validated['tanggal'])
                    ->locale('id')
                    ->dayName
            );

            $shiftDetail = $shift?->shiftDetails()
                ->where('day_of_week', $dayOfWeek)
                ->where('is_active', true)
                ->first();

            $scheduledCheckIn = $shiftDetail?->checkin_time;

            if ($scheduledCheckIn) {
                $actualMinutes = (int) substr($checkIn, 0, 2) * 60
                    + (int) substr($checkIn, 3, 2);

                $scheduleMinutes = (int) substr($scheduledCheckIn, 0, 2) * 60
                    + (int) substr($scheduledCheckIn, 3, 2);

                $lateMinutes = max(0, $actualMinutes - $scheduleMinutes);

                $status = $lateMinutes > $tolerance ? 'late' : 'ontime';

                $statusCheckin = $status === 'late'
                    ? 'Terlambat Tanpa Toleransi'
                    : ($lateMinutes > 0
                        ? 'Terlambat Dengan Toleransi'
                        : 'Tepat Waktu');
            }

            $statusCheckin .= $distance <= $radius
                ? ' - Dalam Jangkauan'
                : ' - Luar Jangkauan';

            return Attendance::create([
                'employee_id' => $employee->id,
                'tanggal' => $validated['tanggal'],
                'name_shift' => $shift?->name_shift ?? '-',

                'check_in' => $checkIn,
                'check_out' => null,

                'checkin_time' => $shiftDetail?->checkin_time,
                'checkout_time' => $shiftDetail?->checkout_time,

                'toleransi_late' => $tolerance,
                'late_minutes' => isset($lateMinutes) ? $lateMinutes : 0,

                'total_waktu' => 0,
                'status' => $status,
                'status_checkin' => $statusCheckin,
                'status_checkout' => null,

                'latitude_checkin' => $validated['latitude_checkin'],
                'longitude_checkin' => $validated['longitude_checkin'],
                'distance_checkin' => round($distance, 2),

                'statusAprv' => $status === 'late' ? 'pending' : 'onTime',
            ]);
        });

        return redirect()
            ->route('attendance.index')
            ->with('success', 'Attendance check-in berhasil dibuat.');
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

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'check_in' => ['nullable', 'date_format:H:i'],
            'check_out' => ['nullable', 'date_format:H:i'],
        ]);

        $attendance->update([
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
        ]);


        if ($attendance->check_in && $attendance->check_out) {

            $start = strtotime($attendance->check_in);
            $end   = strtotime($attendance->check_out);

            $attendance->update([
                'total_waktu' => ($end - $start) / 60
            ]);
        }

        $attendance->refresh();

        return back()->with('success', 'Attendance berhasil diperbarui');
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);

        return Excel::download(new AttendanceExport($request, $columns), 'attendance.xlsx');
    }
}
