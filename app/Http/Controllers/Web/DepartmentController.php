<?php

namespace App\Http\Controllers\Web;

use App\Exports\DepartmentExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\Web\DepartmentResource;
use App\Models\Department;
use App\Services\CodeGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $departments = Department::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kantor/departemen/index', [
            'departments' => DepartmentResource::collection($departments)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('kantor/departemen/create');
    }

    public function store(Request $request, CodeGeneratorService $codeService)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $codeService) {
            $code = $codeService->generate(Department::class, 'department_code', 'DPT', 3);

            Department::create([
                'name' => $validated['name'],
                'department_code' => $code,
            ]);
        });

        return redirect()->route('department.index')->with('success', 'Data departemen berhasil ditambahkan.');
    }

    public function edit(Department $department)
    {
        return inertia('kantor/departemen/edit', [
            'department' => $department,
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $department) {
            $department->update([
                'name' => $validated['name'],
            ]);
        });

        return redirect()->route('department.index')->with('success', 'Data departemen berhasil diperbarui');
    }

    public function destroy(Department $department)
    {
        if ($department) {
            $department->delete();
        }

        return redirect()->route('department.index')->with('success', 'Data departemen berhasil dihapus');
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);
        return Excel::download(new DepartmentExport($request, $columns), 'department.xlsx');
    }
}
