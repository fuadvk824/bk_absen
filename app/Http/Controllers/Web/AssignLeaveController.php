<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\AssignLeaveResource;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveCategory;
use App\Models\Office;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssignLeaveController extends Controller
{
    public function edit(Request $request, LeaveCategory $leave)
    {
        $perPage = $request->get('perPage', 10);

        $employees = Employee::with('office:id,name')
            ->when($request->office_id, function ($q) use ($request) {
                $q->where('office_id', $request->office_id);
            })
            ->when($request->name, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->name}%");
            })

            // ->when($request->masa_kerja, function ($q) use ($request) {
            //     $years = (int) $request->masa_kerja;
            //     $q->whereDate(
            //         'tanggal_awal_kerja',
            //         '<=',
            //         Carbon::now()->subYears($years)
            //     );
            // })
            ->when($request->masa_kerja, function ($q) use ($request) {
                $months = (int) $request->masa_kerja;

                $q->whereDate(
                    'tanggal_awal_kerja',
                    '<=',
                    Carbon::now()->subMonths($months)
                );
            })

            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/cuti/assignLeave', [
            'leave' => $leave,

            'employees' => AssignLeaveResource::collection($employees)
                ->response()
                ->getData(true),

            'offices' => Office::select('id', 'name')->get(),

            'filters' => [
                'office_id' => $request->office_id,
                'name' => $request->name,
                'masa_kerja' => $request->masa_kerja,
                'perPage' => $perPage,
            ],
        ]);
    }
    public function patch(Request $request, LeaveCategory $leave)
    {
        $request->validate([
            'employee_ids' => ['required', 'array'],
            'employee_ids.*' => ['exists:employees,id'],
        ]);

        $employees = Employee::whereIn(
            'id',
            $request->employee_ids
        )->get();

        $assigned = [];
        $rejected = [];

        DB::transaction(function () use (
            $employees,
            $leave,
            &$assigned,
            &$rejected
        ) {

            foreach ($employees as $employee) {

                if (!$employee->tanggal_awal_kerja) {

                    $rejected[] =
                        "{$employee->name} (belum memiliki tanggal awal kerja)";

                    continue;
                }

                $masaKerjaBulan = (int) Carbon::parse(
                    $employee->tanggal_awal_kerja
                )->diffInMonths(now());

                if ($masaKerjaBulan < $leave->masa_bakti) {

                    $rejected[] =
                        "{$employee->name} ({$masaKerjaBulan} bulan)";

                    continue;
                }

                LeaveBalance::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_category_id' => $leave->id,
                        'year' => now()->year,
                    ],
                    [
                        'total_quota' => $leave->max_days,
                        'used_days' => 0,
                        'remaining_days' => $leave->max_days,
                    ]
                );

                $assigned[] = $employee->name;
            }
        });

        $successMessage =
            count($assigned) .
            ' karyawan berhasil diassign ke kategori cuti "' .
            $leave->leave_name .
            '".';

        if (count($rejected) > 0) {

            return back()
                ->with('success', $successMessage)
                ->with(
                    'error',
                    'Karyawan yang tidak memenuhi masa bakti (' .
                        $leave->masa_bakti .
                        ' bulan): ' .
                        implode(', ', $rejected)
                );
        }

        return back()->with(
            'success',
            $successMessage
        );
    }
}
