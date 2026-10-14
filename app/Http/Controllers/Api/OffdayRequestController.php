<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\OffdayRequest;
use App\Models\WorkSchedule;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OffdayRequestController extends Controller
{

    public function schedule(Request $request): JsonResponse
    {
        $user = $request->user();

        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data employee tidak ditemukan.',
            ], 404);
        }


        $now = now();

        $periodStart = $now->copy()
            ->startOfMonth()
            ->day(26)
            ->toDateString();

        $periodEnd = $now->copy()
            ->addMonthNoOverflow()
            ->startOfMonth()
            ->day(25)
            ->toDateString();

        $today = $now->toDateString();

        $rangeStart = max($today, $periodStart);

        $query = WorkSchedule::query()
            ->where('employee_id', $employee->id)
            ->whereHas('workScheduleDays', function ($query) use (
                $rangeStart,
                $periodEnd
            ) {
                $query
                    ->whereDate('work_date', '>=', $rangeStart)
                    ->whereDate('work_date', '<=', $periodEnd);
            })
            ->with([
                'workScheduleDays' => function ($query) use (
                    $rangeStart,
                    $periodEnd
                ) {
                    $query
                        ->whereDate('work_date', '>=', $rangeStart)
                        ->whereDate('work_date', '<=', $periodEnd)
                        ->orderBy('work_date');
                },
            ])
            ->orderByDesc('start_date');

        if ($request->filled('year')) {
            $year = $request->integer('year');

            $yearStart = "{$year}-01-01";
            $yearEnd = "{$year}-12-31";

            $query
                ->whereDate('start_date', '<=', $yearEnd)
                ->whereDate('end_date', '>=', $yearStart);
        }

        $schedules = $query->get();

        $dayIds = $schedules
            ->flatMap(function ($schedule) {
                return $schedule->workScheduleDays->pluck('id');
            })
            ->unique()
            ->values();

        $pendingRequests = OffdayRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->whereIn('work_schedule_day_id', $dayIds)
            ->whereDate('date', '>=', $rangeStart)
            ->whereDate('date', '<=', $periodEnd)
            ->get([
                'id',
                'work_schedule_day_id',
                'date',
                'status_start_date',
                'status_end_date',
                'status',
                'reason',
            ])
            ->keyBy('work_schedule_day_id');

        $colleagueSchedulesQuery = WorkScheduleDay::query()
            ->join(
                'work_schedules',
                'work_schedules.id',
                '=',
                'work_schedule_days.work_schedule_id'
            )
            ->join(
                'employees',
                'employees.id',
                '=',
                'work_schedules.employee_id'
            )
            ->where('employees.id', '!=', $employee->id)
            ->where('employees.office_id', $employee->office_id)
            ->where('employees.department_id', $employee->department_id)
            ->where('employees.position_id', $employee->position_id)
            ->where('work_schedule_days.is_off', true)
            ->whereDate('work_schedule_days.work_date', '>=', $rangeStart)
            ->whereDate('work_schedule_days.work_date', '<=', $periodEnd);

        if ($request->filled('year')) {
            $year = $request->integer('year');

            $yearStart = "{$year}-01-01";
            $yearEnd = "{$year}-12-31";

            $colleagueSchedulesQuery
                ->whereDate('work_schedule_days.work_date', '>=', $yearStart)
                ->whereDate('work_schedule_days.work_date', '<=', $yearEnd);
        }

        $colleagueSchedules = $colleagueSchedulesQuery
            ->orderBy('employees.name')
            ->orderBy('work_schedule_days.work_date')
            ->get([
                'work_schedule_days.id',
                'work_schedule_days.work_schedule_id',
                'work_schedule_days.work_date',
                'work_schedule_days.is_off',
                'work_schedule_days.note',
                'employees.id as employee_id',
                'employees.name as employee_name',
            ])
            ->groupBy('employee_id');

        $colleaguePendingRequestsQuery = OffdayRequest::query()
            ->join(
                'work_schedule_days',
                'work_schedule_days.id',
                '=',
                'offday_requests.work_schedule_day_id'
            )
            ->join(
                'work_schedules',
                'work_schedules.id',
                '=',
                'work_schedule_days.work_schedule_id'
            )
            ->join(
                'employees',
                'employees.id',
                '=',
                'offday_requests.employee_id'
            )
            ->where('employees.id', '!=', $employee->id)
            ->where('employees.office_id', $employee->office_id)
            ->where('employees.department_id', $employee->department_id)
            ->where('employees.position_id', $employee->position_id)
            ->where('offday_requests.status', 'pending')
            ->whereDate('offday_requests.date', '>=', $rangeStart)
            ->whereDate('offday_requests.date', '<=', $periodEnd);

        if ($request->filled('year')) {
            $year = $request->integer('year');

            $yearStart = "{$year}-01-01";
            $yearEnd = "{$year}-12-31";

            $colleaguePendingRequestsQuery
                ->whereDate('offday_requests.date', '>=', $yearStart)
                ->whereDate('offday_requests.date', '<=', $yearEnd);
        }

        $colleaguePendingRequests = $colleaguePendingRequestsQuery
            ->orderBy('employees.name')
            ->orderBy('offday_requests.date')
            ->get([
                'offday_requests.id',
                'offday_requests.employee_id',
                'offday_requests.work_schedule_day_id',
                'offday_requests.date',
                'offday_requests.status_start_date',
                'offday_requests.status_end_date',
                'offday_requests.status',
                'offday_requests.reason',
                'work_schedule_days.work_date as scheduled_work_date',
                'employees.name as employee_name',
            ])
            ->groupBy('employee_id');

        return response()->json([
            'success' => true,
            'message' => 'Jadwal kerja berhasil diambil.',

            'period_start' => $periodStart,
            'period_end' => $periodEnd,

            'data' => $schedules->map(function ($schedule) use (
                $pendingRequests
            ) {
                return [
                    'id' => $schedule->id,
                    'start_date' => $schedule->start_date?->format('Y-m-d'),
                    'end_date' => $schedule->end_date?->format('Y-m-d'),
                    'total_work_days' => $schedule->total_work_days,
                    'total_off_days' => $schedule->total_off_days,

                    'days' => $schedule->workScheduleDays
                        ->map(function ($day) use ($pendingRequests) {
                            $pending = $pendingRequests->get($day->id);

                            return [
                                'id' => $day->id,
                                'work_date' => $day->work_date?->format('Y-m-d'),
                                'is_off' => (bool) $day->is_off,
                                'status' => $day->is_off ? 'libur' : 'masuk',
                                'note' => $day->note,

                                'has_pending_request' => $pending !== null,

                                'pending_request' => $pending
                                    ? [
                                        'id' => $pending->id,
                                        'date' => $pending->date?->format('Y-m-d'),
                                        'status_start_date' => $pending->status_start_date,
                                        'status_end_date' => $pending->status_end_date,
                                        'status' => $pending->status,
                                        'reason' => $pending->reason,
                                    ]
                                    : null,
                            ];
                        })
                        ->values(),
                ];
            })->values(),

            'colleague_offdays' => $colleagueSchedules
                ->map(function ($days) {
                    $first = $days->first();

                    return [
                        'employee_id' => $first->employee_id,
                        'employee_name' => $first->employee_name,

                        'offdays' => $days
                            ->map(function ($day) {
                                return [
                                    'id' => $day->id,
                                    'work_schedule_id' => $day->work_schedule_id,
                                    'work_date' => Carbon::parse(
                                        $day->work_date
                                    )->format('Y-m-d'),
                                    'is_off' => (bool) $day->is_off,
                                    'note' => $day->note,
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values(),

            'colleague_pending_offday_requests' => $colleaguePendingRequests
                ->map(function ($requests) {
                    $first = $requests->first();

                    return [
                        'employee_id' => $first->employee_id,
                        'employee_name' => $first->employee_name,

                        'pending_requests' => $requests
                            ->map(function ($request) {
                                return [
                                    'id' => $request->id,
                                    'work_schedule_day_id' =>
                                    $request->work_schedule_day_id,

                                    'date' => Carbon::parse(
                                        $request->date
                                    )->format('Y-m-d'),

                                    'status_start_date' =>
                                    $request->status_start_date,

                                    'status_end_date' =>
                                    $request->status_end_date,

                                    'status' => $request->status,
                                    'reason' => $request->reason,
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values(),
        ]);
    }


    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::query()->where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data employee tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000',],
            'changes' => ['required', 'array', 'min:1',],
            'changes.*.work_schedule_day_id' => ['required', 'integer', 'distinct', 'exists:work_schedule_days,id',],
            'changes.*.status' => ['required',  Rule::in(['masuk', 'libur']),],
        ]);

        return DB::transaction(function () use ($validated, $employee) {

            $dayIds = collect($validated['changes'])->pluck('work_schedule_day_id')->values();
            $today = now()->toDateString();

            $days = DB::table('work_schedule_days')
                ->join(
                    'work_schedules',
                    'work_schedules.id',
                    '=',
                    'work_schedule_days.work_schedule_id'
                )
                ->where('work_schedules.employee_id', $employee->id)
                ->whereIn('work_schedule_days.id', $dayIds)
                ->select([
                    'work_schedule_days.id',
                    'work_schedule_days.work_date',
                    'work_schedule_days.is_off',
                ])
                ->get()
                ->keyBy('id');

            if ($days->count() !== $dayIds->count()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terdapat jadwal yang bukan milik Anda.',
                ], 422);
            }

            $pastDay = $days->first(function ($day) use ($today) {
                return Carbon::parse($day->work_date)->toDateString() < $today;
            });

            if ($pastDay) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal yang sudah lewat tidak dapat diajukan.',
                ], 422);
            }

            $requestedLeaveDates = collect($validated['changes'])
                ->filter(function ($change) {
                    return $change['status'] === 'libur';
                })
                ->map(function ($change) use ($days) {
                    $day = $days->get($change['work_schedule_day_id']);

                    return $day
                        ? Carbon::parse($day->work_date)->toDateString()
                        : null;
                })->filter()->unique()->values();


            if ($requestedLeaveDates->isNotEmpty()) {

                $colleagueConflicts = WorkScheduleDay::query()
                    ->join(
                        'work_schedules',
                        'work_schedules.id',
                        '=',
                        'work_schedule_days.work_schedule_id'
                    )
                    ->join(
                        'employees',
                        'employees.id',
                        '=',
                        'work_schedules.employee_id'
                    )
                    ->where('employees.id', '!=', $employee->id)
                    ->where('employees.office_id', $employee->office_id)
                    ->where('employees.department_id', $employee->department_id)
                    ->where('employees.position_id', $employee->position_id)
                    ->where('work_schedule_days.is_off', true)
                    ->whereIn(
                        'work_schedule_days.work_date',
                        $requestedLeaveDates
                    )
                    ->get([
                        'work_schedule_days.id',
                        'work_schedule_days.work_schedule_id',
                        'work_schedule_days.work_date',
                        'work_schedule_days.is_off',
                        'work_schedule_days.note',
                        'employees.id as employee_id',
                        'employees.name as employee_name',
                    ])
                    ->groupBy(function ($day) {
                        return Carbon::parse($day->work_date)->toDateString();
                    });

                if ($colleagueConflicts->isNotEmpty()) {

                    $conflictData = [];

                    foreach ($colleagueConflicts as $date => $conflicts) {

                        $conflictData[] = [
                            'date' => $date,

                            'employees' => $conflicts
                                ->map(function ($conflict) {
                                    return [
                                        'employee_id' => $conflict->employee_id,
                                        'employee_name' => $conflict->employee_name,
                                        'status' => 'libur',
                                    ];
                                })
                                ->unique('employee_id')
                                ->values(),
                        ];
                    }

                    return response()->json([
                        'success' => false,
                        'message' =>
                        'Terdapat tanggal yang sudah menjadi jadwal libur rekan kerja.',

                        'conflicts' => $conflictData,
                    ], 422);
                }
            }

            $requests = [];

            foreach ($validated['changes'] as $change) {
                $day = $days->get($change['work_schedule_day_id']);
                $currentStatus = $day->is_off ? 'libur' : 'masuk';

                if ($currentStatus === $change['status']) {
                    continue;
                }

                $existing = OffdayRequest::query()
                    ->where('employee_id',  $employee->id)
                    ->where('work_schedule_day_id', $day->id)
                    ->where('status', 'pending')
                    ->exists();

                if ($existing) {
                    continue;
                }

                $requests[] = [
                    'employee_id' => $employee->id,
                    'work_schedule_day_id' => $day->id,

                    'date' => Carbon::parse($day->work_date)->toDateString(),
                    'status_start_date' => $currentStatus,
                    'status_end_date' => $change['status'],
                    'status' => 'pending',
                    'reason' => $validated['reason'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (empty($requests)) {
                return response()->json([
                    'success' => false,
                    'message' =>
                    'Tidak ada perubahan jadwal yang dapat diajukan.',
                ], 422);
            }

            OffdayRequest::insert($requests);

            return response()->json([
                'success' => true,
                'message' =>  'Pengajuan perubahan jadwal berhasil dikirim.',

                'data' => [
                    'total' => count($requests),
                ],
            ], 201);
        });
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data employee tidak ditemukan.',
            ], 404);
        }

        $offdayRequest = OffdayRequest::query()
            ->where('id', $id)
            ->where('employee_id', $employee->id)
            ->first();

        if (!$offdayRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.',
            ], 404);
        }

        if ($offdayRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' =>
                'Hanya pengajuan berstatus pending yang dapat dihapus.',
            ], 422);
        }

        $offdayRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan offday berhasil dihapus.',
            'data' => [
                'id' => $id,
            ],
        ]);
    }
}
