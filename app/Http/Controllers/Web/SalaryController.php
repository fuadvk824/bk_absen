<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\SalaryRequest;
use App\Http\Resources\Web\SalaryResource;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Salary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalaryController extends Controller
{

    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $salaries = Salary::query()
            ->with(['employee.office'])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('employee', function ($emp) use ($request) {
                    $emp->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('office_id'), function ($q) use ($request) {
                $q->whereHas('employee', function ($emp) use ($request) {
                    $emp->where('office_id', $request->office_id);
                });
            })
            ->when($request->filled('min_salary'), function ($q) use ($request) {
                $q->where('daily_salary', '>=', $request->min_salary);
            })
            ->when($request->filled('max_salary'), function ($q) use ($request) {
                $q->where('daily_salary', '<=', $request->max_salary);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/gaji/index', [
            'salaries' => SalaryResource::collection($salaries)
                ->response()
                ->getData(true),

            'employees' => Employee::query()
                ->whereDoesntHave('salaries')
                ->orWhere(function ($q) use ($request) {
                    if ($request->filled('salary_id')) {
                        $salary = Salary::find($request->salary_id);

                        if ($salary) {
                            $q->where('id', $salary->employee_id);
                        }
                    }
                })
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'offices' => Office::query()
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get(),

            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
                'min_salary' => $request->min_salary,
                'max_salary' => $request->max_salary,
                'office_id' => $request->office_id,
            ],
        ]);
    }

    public function store(SalaryRequest $request)
    {
        DB::transaction(function () use ($request) {
            Salary::create($request->validated());
        });

        return redirect()
            ->back()
            ->with('success', 'Salary berhasil ditambahkan.');
    }

    public function update(SalaryRequest $request, Salary $salary)
    {
        DB::transaction(function () use ($request, $salary) {
            $salary->update($request->validated());
        });

        return redirect()
            ->back()
            ->with('success', 'Salary berhasil diperbarui.');
    }

    public function destroy(Salary $salary)
    {
        $salary->delete();

        return redirect()
            ->back()
            ->with('success', 'Salary berhasil dihapus.');
    }
}
