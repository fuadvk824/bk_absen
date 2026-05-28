<?php

namespace App\Http\Controllers\Web;

use App\Exports\OvertimeExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\Web\OvertimeResource;
use App\Models\Department;
use App\Models\Office;
use App\Models\Overtime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class OvertimeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $overtimes = Overtime::filter($request)->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('pengajuan/lembur/index', [
            'overtimes' => OvertimeResource::collection($overtimes)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'office_id' => $request->office_id,
                'department_id' => $request->department_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'perPage' => $perPage,
            ],
            'departments' => Department::select('id', 'name')->get(),
            'offices' => Office::select('id', 'name')->get(),
        ]);
    }

    public function updateStatus(Request $request, Overtime $overtime)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $overtime->update([
            'status' => $request->status,
        ]);

        $status = $request->status;

        return redirect()
            ->route('overtime.index')
            ->with('success', "Status overtime berhasil di {$status}");
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);
        return Excel::download(new OvertimeExport($request, $columns), 'overtime.xlsx');
    }
}
