<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveBalance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    public function index(Request $request)
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
        $leaves = Leave::with('leaveCategory')
            ->where('employee_id', $employee->id)
            ->latest()
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,

                    'leave_name' => $leave->leaveCategory->leave_name ?? null,
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,

                    'file' => $leave->file,
                    'reason' => $leave->reason,
                    'status' => $leave->status,

                    'warna' => match ($leave->status) {
                        'pending' => 0xffffc107,
                        'approved' => 0xff4caf50,
                        'rejected' => 0xfff44336,
                    },
                ];
            });

        $balances = LeaveBalance::with('leaveCategory')
            ->where('employee_id', $employee->id)
            ->where('year', now()->year)
            ->get()
            ->map(function ($balance) {
                return [
                    'leave_name' => $balance->leaveCategory->leave_name ?? null,
                    'total_quota' => $balance->total_quota,
                    'used_days' => $balance->used_days,
                    'remaining_days' => $balance->remaining_days,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'leaves' => $leaves,
                'balances' => $balances,
            ],
        ]);
    }

    public function categories(Request $request)
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

        $categories = LeaveBalance::with('leaveCategory')
            ->where('employee_id', $employee->id)
            ->where('year', now()->year)
            ->get()
            ->map(function ($balance) {
                return [
                    'id' => $balance->leave_category_id,
                    'leave_name' => $balance->leaveCategory->leave_name ?? null,
                    'remaining_days' => $balance->remaining_days,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $employeeId = $request->user()->employees->id;

            $request->validate([
                'leave_categories_id' => 'required|exists:leave_categories,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date',
                'reason' => 'nullable|string',
                'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:2048',
            ]);

            if (Carbon::parse($request->end_date)->lt(Carbon::parse($request->start_date))) {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Tanggal selesai harus setelah tanggal mulai',
                    ],
                    400,
                );
            }

            return DB::transaction(function () use ($request, $employeeId) {
                $filePath = null;

                if ($request->hasFile('file')) {
                    $file = $request->file('file');

                    $fileName = time() . '_' . $file->getClientOriginalName();

                    $filePath = $file->storeAs('leave_files', $fileName, 'public');
                }

                $start = Carbon::parse($request->start_date);
                $end = Carbon::parse($request->end_date);
                $totalDays = $start->diffInDays($end) + 1;

                $balance = LeaveBalance::where([
                    'employee_id' => $employeeId,
                    'leave_category_id' => $request->leave_categories_id,
                    'year' => now()->year,
                ])->first();

                if (!$balance) {
                    return response()->json(
                        [
                            'success' => false,
                            'message' => 'Jatah cuti tidak ditemukan',
                        ],
                        400,
                    );
                }

                if ($totalDays > $balance->remaining_days) {
                    return response()->json(
                        [
                            'success' => false,
                            'message' => 'Sisa cuti tidak mencukupi',
                        ],
                        400,
                    );
                }

                $leave = Leave::create([
                    'employee_id' => $employeeId,
                    'leave_categories_id' => $request->leave_categories_id,

                    'submit' => now()->toDateString(),

                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'total_days' => $totalDays,

                    'file' => $filePath ? url('storage/' . $filePath) : null,
                    'reason' => $request->reason,
                    'status' => 'pending',
                ]);

                return response()->json(
                    [
                        'success' => true,
                        'message' => 'Pengajuan leave berhasil',
                        'data' => $leave,
                    ],
                    200,
                );
            });
        } catch (\Exception $e) {
            return response()->json(
                [
                    'message' => 'Gagal mengajukan leave',
                    'error' => $e->getMessage(),
                ],
                500,
            );
        }
    }
}
