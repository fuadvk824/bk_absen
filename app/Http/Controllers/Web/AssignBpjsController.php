<?php

namespace App\Http\Controllers\Web;


use App\Http\Controllers\Controller;
use App\Http\Resources\Web\AssignBpjsResource;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssignBpjsController extends Controller
{
    public function edit(Request $request)
    {
        $perPage = $request->integer('perPage', 10);
        $status = $request->input('status', 'all');

        if (!in_array($status, ['all', 'assigned', 'unassigned'], true)) {
            $status = 'all';
        }

        $latestSalaryId = Salary::query()
            ->select('id')
            ->whereColumn('employee_id', 'employees.id')
            ->orderByDesc('id')
            ->limit(1);

        $latestBpjs = Salary::query()
            ->select('bpjs')
            ->whereColumn('employee_id', 'employees.id')
            ->orderByDesc('id')
            ->limit(1);

        $employees = Employee::query()
            ->with('office:id,name')
            ->addSelect([
                'latest_salary_id' => $latestSalaryId,
                'latest_bpjs' => $latestBpjs,
            ])

            ->when($request->filled('office_id'), function ($q) use ($request) {
                $q->where('employees.office_id', $request->office_id);
            })

            ->when($request->filled('name'), function ($q) use ($request) {
                $q->where(
                    'employees.name',
                    'like',
                    '%' . $request->name . '%'
                );
            })

            ->when($request->filled('masa_kerja'), function ($q) use ($request) {
                $months = (int) $request->masa_kerja;

                $q->whereNotNull('employees.tanggal_awal_kerja')
                    ->whereDate(
                        'employees.tanggal_awal_kerja',
                        '<=',
                        now()->subMonths($months)->toDateString()
                    );
            })

            ->when($status === 'assigned', function ($q) use ($latestSalaryId) {
                $q->whereIn('employees.id', function ($subQuery) {
                    $subQuery->select('s.employee_id')
                        ->from('salaries as s')
                        ->whereRaw('s.id = (
                        SELECT s2.id
                        FROM salaries AS s2
                        WHERE s2.employee_id = s.employee_id
                        ORDER BY s2.id DESC
                        LIMIT 1
                    )')
                        ->whereNotNull('s.bpjs')
                        ->where('s.bpjs', '>', 0);
                });
            })

            ->when($status === 'unassigned', function ($q) {
                $q->where(function ($subQuery) {
                    $subQuery->whereNotIn('employees.id', function ($salaryQuery) {
                        $salaryQuery->select('employee_id')
                            ->from('salaries');
                    })

                        ->orWhereIn('employees.id', function ($salaryQuery) {
                            $salaryQuery->select('s.employee_id')
                                ->from('salaries as s')
                                ->whereRaw('s.id = (
                            SELECT s2.id
                            FROM salaries AS s2
                            WHERE s2.employee_id = s.employee_id
                            ORDER BY s2.id DESC
                            LIMIT 1
                        )')
                                ->where(function ($bpjsQuery) {
                                    $bpjsQuery->whereNull('s.bpjs')
                                        ->orWhere('s.bpjs', '<=', 0);
                                });
                        });
                });
            })

            ->orderBy('employees.name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('payroll/bpjs/assignBpjs', [
            'employees' => AssignBpjsResource::collection($employees)
                ->response()
                ->getData(true),

            'offices' => Office::select('id', 'name')->get(),

            'filters' => [
                'office_id' => $request->office_id,
                'name' => $request->name,
                'masa_kerja' => $request->masa_kerja,
                'status' => $status,
                'perPage' => $perPage,
            ],
        ]);
    }


    public function patch(Request $request)
    {
        $validated = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1'],
            'employee_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:employees,id',
            ],
        ]);

        $assigned = [];
        $rejected = [];

        DB::transaction(function () use (
            $validated,
            &$assigned,
            &$rejected
        ) {
            $employees = Employee::whereIn(
                'id',
                $validated['employee_ids']
            )->get();

            foreach ($employees as $employee) {
                if (!$employee->tanggal_awal_kerja) {
                    $rejected[] =
                        "{$employee->name} (tanggal awal kerja belum diisi)";
                    continue;
                }

                $months = (int) Carbon::parse(
                    $employee->tanggal_awal_kerja
                )->diffInMonths(now());

                if ($months < 18) {
                    $rejected[] =
                        "{$employee->name} (masa kerja {$months} bulan)";
                    continue;
                }

                $salary = Salary::where('employee_id', $employee->id)
                    ->orderByDesc('id')
                    ->first();

                if (!$salary) {
                    $rejected[] =
                        "{$employee->name} (data salary belum tersedia)";
                    continue;
                }

                if ($salary->daily_salary === null) {
                    $rejected[] =
                        "{$employee->name} (daily salary belum tersedia)";
                    continue;
                }

                $salary->update([
                    'bpjs' => 100000,
                ]);

                $assigned[] = $employee->name;
            }
        });

        $message = count($assigned)
            . ' karyawan berhasil diassign BPJS.';

        if (count($rejected)) {
            return back()
                ->with('success', $message)
                ->with(
                    'error',
                    'Karyawan tidak diproses: ' .
                        implode(', ', $rejected)
                );
        }

        return back()->with('success', $message);
    }
}
