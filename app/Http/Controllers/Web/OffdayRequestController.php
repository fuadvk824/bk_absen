<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\OffdayRequestResource;
use App\Models\Department;
use App\Models\OffdayRequest;
use App\Models\Office;
use App\Models\Position;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OffdayRequestController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('perPage', 10);
        $perPage = max(1, min(100, $perPage));

        $today = Carbon::today();

        $defaultPeriodStart = $today->copy()
            ->startOfMonth()
            ->day(26);

        $defaultMonth = $defaultPeriodStart->month;
        $defaultYear = $defaultPeriodStart->year;

        $month = (int) $request->input('month', $defaultMonth);
        $year = (int) $request->input('year', $defaultYear);

        $month = max(1, min(12, $month));
        $year = max(2000, min(2100, $year));

        $periodStart = Carbon::create($year, $month, 26)->startOfDay();

        $periodEnd = $periodStart
            ->copy()
            ->addMonthNoOverflow()
            ->day(25)
            ->endOfDay();


        // $search = trim((string) $request->input('search', ''));
        // $status = $request->input('status', '');

        // $officeId = $request->input('office_id', '');
        // $departmentId = $request->input('department_id', '');
        // $positionId = $request->input('position_id', '');
        $search = trim((string) $request->input('search', ''));

        $status = $request->input('status');
        $officeId = $request->input('office_id');
        $departmentId = $request->input('department_id');
        $positionId = $request->input('position_id');

        $normalizeFilterId = static function ($value): ?int {
            if (
                $value === null ||
                $value === '' ||
                $value === 'all'
            ) {
                return null;
            }

            $id = filter_var($value, FILTER_VALIDATE_INT);

            return $id !== false && $id > 0 ? $id : null;
        };

        $officeId = $normalizeFilterId($officeId);
        $departmentId = $normalizeFilterId($departmentId);
        $positionId = $normalizeFilterId($positionId);

        if (!in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $status = null;
        }


        $query = OffdayRequest::query()
            ->join(
                'employees',
                'offday_requests.employee_id',
                '=',
                'employees.id'
            )
            ->leftJoin(
                'positions',
                'employees.position_id',
                '=',
                'positions.id'
            )
            ->leftJoin(
                'departments',
                'employees.department_id',
                '=',
                'departments.id'
            )
            ->leftJoin(
                'offices',
                'employees.office_id',
                '=',
                'offices.id'
            )
            ->whereBetween('offday_requests.date', [
                $periodStart->toDateString(),
                $periodEnd->toDateString(),
            ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('employees.name', 'like', "%{$search}%")
                    ->orWhere(
                        'employees.employee_code',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        if ($officeId !== null) {
            $query->where('employees.office_id', $officeId);
        }

        if ($departmentId !== null) {
            $query->where('employees.department_id', $departmentId);
        }

        if ($positionId !== null) {
            $query->where('employees.position_id', $positionId);
        }

        if ($status !== null) {
            $query->where('offday_requests.status', $status);
        }

        $requests = $query
            ->select([
                'employees.id as employee_id',
                'employees.employee_code',
                'employees.name as employee_name',
                'employees.position_id',
                'positions.name as position_name',
                'employees.department_id',
                'departments.name as department_name',
                'employees.office_id',
                'offices.name as office_name',
                'offday_requests.status',
            ])

            ->selectRaw(
                'MIN(offday_requests.date) as first_request_date'
            )
            ->selectRaw(
                'MAX(offday_requests.date) as last_request_date'
            )
            ->selectRaw(
                'MIN(offday_requests.since) as since'
            )
            ->selectRaw(
                'GROUP_CONCAT(
                    DATE_FORMAT(offday_requests.date, "%Y-%m-%d")
                    ORDER BY offday_requests.date ASC
                    SEPARATOR ","
                ) as request_dates'
            )
            ->selectRaw(
                'COUNT(offday_requests.id) as total_requests'
            )
            ->selectRaw(
                'GROUP_CONCAT(
                    COALESCE(offday_requests.status_start_date, "")
                    ORDER BY offday_requests.date ASC
                    SEPARATOR "|"
                ) as request_status_start_dates'
            )
            ->selectRaw(
                'GROUP_CONCAT(
                    COALESCE(offday_requests.status_end_date, "")
                    ORDER BY offday_requests.date ASC
                    SEPARATOR "|"
                ) as request_status_end_dates'
            )


            ->groupBy([
                'employees.id',
                'employees.employee_code',
                'employees.name',
                'employees.position_id',
                'positions.name',
                'employees.department_id',
                'departments.name',
                'employees.office_id',
                'offices.name',
                'offday_requests.status',
            ])
            ->orderBy('offday_requests.status', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $requests->getCollection()->transform(function ($item) use (
            $periodStart,
            $periodEnd
        ) {
            $item->period_start = $periodStart->toDateString();
            $item->period_end = $periodEnd->toDateString();

            return $item;
        });

        return Inertia::render('pengajuan/libur/index', [
            'requests' => OffdayRequestResource::collection($requests),

            'filters' => [
                'month' => $month,
                'year' => $year,
                'perPage' => $perPage,
                'search' => $search,
                'status' => $status,
                'office_id' => $officeId,
                'department_id' => $departmentId,
                'position_id' => $positionId,
            ],

            'periodLabel' => $periodStart->translatedFormat('d F')
                . ' - '
                . $periodEnd->translatedFormat('d F'),

            'positions' => Position::query()
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get(),

            'departments' => Department::query()
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get(),

            'offices' => Office::query()
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }

    public function updateGroupStatus(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'integer',
                'exists:employees,id',
            ],
            'period_start' => [
                'required',
                'date_format:Y-m-d',
            ],
            'current_status' => [
                'required',
                'in:pending',
            ],
            'status' => [
                'required',
                'in:approved,rejected',
            ],
        ]);

        $periodStart = Carbon::createFromFormat(
            'Y-m-d',
            $validated['period_start']
        )->startOfDay();

        if ($periodStart->day !== 26) {
            return back()->withErrors([
                'period_start' => 'Tanggal awal periode harus tanggal 26.',
            ]);
        }

        $periodEnd = $periodStart
            ->copy()
            ->addMonthNoOverflow()
            ->day(25)
            ->endOfDay();

        $updated = DB::transaction(function () use ($validated, $periodStart, $periodEnd) {
            return $this->updatePendingRequestsForPeriod(
                (int) $validated['employee_id'],
                $periodStart,
                $periodEnd,
                $validated['status']
            );
        });

        if ($updated === 0) {
            return back()->with(
                'info',
                'Tidak ada pengajuan pending yang perlu diperbarui.'
            );
        }

        $action = $validated['status'] === 'approved'
            ? 'disetujui'
            : 'ditolak';

        return back()->with(
            'success',
            "{$updated} pengajuan berhasil {$action}."
        );
    }

    public function updateBulkGroupStatus(Request $request)
    {
        $validated = $request->validate([
            'groups' => ['required', 'array', 'min:1'],
            'groups.*.employee_id' => [
                'required',
                'integer',
                'distinct',
                'exists:employees,id',
            ],
            'groups.*.period_start' => [
                'required',
                'date_format:Y-m-d',
            ],
            'groups.*.current_status' => [
                'required',
                'in:pending',
            ],
            'status' => [
                'required',
                'in:approved,rejected',
            ],
        ]);

        $groups = collect($validated['groups']);

        foreach ($groups as $group) {
            $start = Carbon::createFromFormat(
                'Y-m-d',
                $group['period_start']
            );

            if ($start->day !== 26) {
                return back()->withErrors([
                    'groups' => 'Tanggal awal periode harus tanggal 26.',
                ]);
            }
        }

        $updated = DB::transaction(function () use ($groups, $validated) {
            $totalUpdated = 0;

            foreach ($groups as $group) {
                $periodStart = Carbon::createFromFormat(
                    'Y-m-d',
                    $group['period_start']
                )->startOfDay();

                $periodEnd = $periodStart
                    ->copy()
                    ->addMonthNoOverflow()
                    ->day(25)
                    ->endOfDay();

                $totalUpdated += $this->updatePendingRequestsForPeriod(
                    (int) $group['employee_id'],
                    $periodStart,
                    $periodEnd,
                    $validated['status']
                );
            }

            return $totalUpdated;
        });

        if ($updated === 0) {
            return back()->with(
                'info',
                'Tidak ada pengajuan pending yang perlu diperbarui.'
            );
        }

        $action = $validated['status'] === 'approved'
            ? 'disetujui'
            : 'ditolak';

        return back()->with(
            'success',
            "{$updated} pengajuan berhasil {$action}."
        );
    }

    private function updatePendingRequestsForPeriod(
        int $employeeId,
        Carbon $periodStart,
        Carbon $periodEnd,
        string $status
    ): int {
        $pendingRequests = OffdayRequest::query()
            ->where('employee_id', $employeeId)
            ->whereBetween('date', [
                $periodStart->toDateString(),
                $periodEnd->toDateString(),
            ])
            ->where('status', 'pending')
            ->lockForUpdate()
            ->get(['id', 'work_schedule_day_id']);

        if ($pendingRequests->isEmpty()) {
            return 0;
        }

        $requestIds = $pendingRequests->pluck('id');

        $scheduleDayIds = $pendingRequests
            ->pluck('work_schedule_day_id')
            ->unique()
            ->values();

        $updated = OffdayRequest::query()
            ->whereIn('id', $requestIds)
            ->where('status', 'pending')
            ->update([
                'status' => $status,
                'updated_at' => now(),
            ]);

        if ($status === 'approved' && $updated > 0) {
            DB::table('work_schedule_days')
                ->whereIn('id', $scheduleDayIds)
                ->update([
                    'is_off' => true,
                    'updated_at' => now(),
                ]);
        }

        return $updated;
    }
}
