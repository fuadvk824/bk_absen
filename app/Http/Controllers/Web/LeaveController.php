<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\LeaveRequest;
use App\Http\Resources\Web\LeaveBalanceResource;
use App\Http\Resources\Web\LeaveResource;
use App\Models\LeaveBalance;
use App\Models\LeaveCategory;
use App\Models\Office;
use App\Services\CodeGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $leaves = LeaveCategory::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('leave_name', 'like', '%' . $request->search . '%');
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/cuti/index', [
            'leaves' => LeaveResource::collection($leaves)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function balances(Request $request, LeaveCategory $leave)
    {
        $year = $request->integer('year', now()->year);
        $perPage = $request->integer('perPage', 10);
        $search = trim($request->string('search')->toString());

        $year = max(2000, min($year, 2100));
        $perPage = in_array($perPage, [10, 25, 50, 100, 500], true)
            ? $perPage
            : 10;
        $officeId = $request->input('office_id');
        $balances = LeaveBalance::query()
            ->with([
                'employee.office',
            ])
            ->where('leave_category_id', $leave->id)
            ->where('year', $year)
            ->when($officeId, function ($query) use ($officeId) {
                $query->whereHas('employee', function ($employeeQuery) use ($officeId) {
                    $employeeQuery->where('office_id', $officeId);
                });
            })
            ->when(
                mb_strlen($search) >= 3,
                function ($query) use ($search) {
                    $query->whereHas('employee', function ($employeeQuery) use ($search) {
                        $employeeQuery->where('name', 'like', '%' . $search . '%');
                    });
                }
            )
            ->orderBy('employee_id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/cuti/balances', [
            'leave' => [
                'id' => $leave->id,
                'leave_code' => $leave->leave_code,
                'leave_name' => $leave->leave_name,
            ],
            'balances' => LeaveBalanceResource::collection($balances)
                ->response()
                ->getData(true),
            'offices' => Office::query()
                ->select('id', 'office_code', 'name')
                ->orderBy('name', 'asc')
                ->get(),
            'filters' => [
                'year' => $year,
                'perPage' => $perPage,
                'search' => mb_strlen($search) >= 3 ? $search : '',
                'office_id' => $officeId,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('kategori/cuti/create');
    }

    public function store(LeaveRequest $request, CodeGeneratorService $codeService)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $codeService) {
            $code = $codeService->generate(LeaveCategory::class, 'leave_code', 'LVE', 3);

            LeaveCategory::create([
                'leave_code' => $code,
                'leave_name' => $validated['leave_name'],
                'max_days' => $validated['max_days'],
                'masa_bakti' => $validated['masa_bakti'],
                'reset' => $validated['reset'],
            ]);
        });

        return redirect()->route('leave.index')->with('success', 'Kategori cuti berhasil ditambahkan.');
    }

    public function edit(LeaveCategory $leave)
    {
        return inertia('pengajuan/cuti/edit', [
            'leave' => $leave,
        ]);
    }

    public function update(LeaveRequest $request, LeaveCategory $leave)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $leave) {
            $leave->update([
                'leave_name' => $validated['leave_name'],
                'max_days' => $validated['max_days'],
                'masa_bakti' => $validated['masa_bakti'],
                'reset' => $validated['reset'],
            ]);
        });

        return redirect()->route('leave.index')->with('success', 'Kategori cuti berhasil diperbarui');
    }

    public function destroy(LeaveCategory $leave)
    {
        if ($leave) {
            $leave->delete();
        }

        return redirect()->route('leave.index')->with('success', 'Kategori cuti berhasil dihapus');
    }
}
