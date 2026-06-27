<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\LeaveRequest;
use App\Http\Resources\Web\LeaveResource;
use App\Models\LeaveCategory;
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
