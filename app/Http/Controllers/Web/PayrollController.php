<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\PayrollResource;
use App\Models\Attendance;
use App\Models\Office;
use App\Models\Payroll;
use App\Services\GeneratePayrollService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $payrolls = Payroll::query()
            ->with(['employee.department', 'employee.position', 'items.source'])
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('employee', function ($employee) use ($request) {
                    $employee->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->office_id, function ($q) use ($request) {
                $q->whereHas('employee', function ($employee) use ($request) {
                    $employee->where('office_id', $request->office_id);
                });
            })
            ->when($request->status, fn($q) => $q->where('is_locked', $request->status))
            ->when($request->month, function ($q) use ($request) {
                $q->where('month', $request->month);
            })
            ->when($request->year, function ($q) use ($request) {
                $q->where('year', $request->year);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('payroll/index', [
            'payrolls' => PayrollResource::collection($payrolls)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'month' => $request->month,
                'year' => $request->year,
                'status' => $request->status,
                'office_id' => $request->office_id,
                'perPage' => $perPage,
            ],
            'offices' => Office::select('id', 'name')->get(),
        ]);
    }

    public function generate(Request $request, GeneratePayrollService $service)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'dates' => 'nullable|array',
            'dates.*' => 'date',
        ]);

        $service->handle($request->month, $request->year, $request->dates ?? []);

        return back()->with('success', 'Payroll berhasil digenerate');
    }

    public function lock(Payroll $payroll)
    {
        if ($payroll->is_locked == 'lunas') {
            return back()->with('error', 'Payroll sudah dibayarkan');
        }
        $payroll->update([
            'is_locked' => 'lunas',
        ]);

        return back()->with('success', 'Payroll berhasil ditandai sudah dibayar');
    }

    public function show(Payroll $payroll)
    {
        $payroll->load(['employee.department', 'employee.position', 'items']);

        return Inertia::render('payroll/show', [
            'payroll' => new PayrollResource($payroll),
        ]);
    }

    public function downloadPdf($id)
    {
        $payroll = Payroll::with(['employee.department', 'employee.position', 'items'])->findOrFail($id);

        $basicSalaryItem = $payroll->items->where('name', 'Gaji Harian')->first();
        $holidayBonusTotal = $payroll->items->where('name', 'Bonus Tanggal Merah')->sum('amount');
        $overtimeTotal = $payroll->items->where('name', 'Lembur')->sum('amount');
        $latePenaltyTotal = $payroll->items->where('name', 'Denda Keterlambatan')->sum('amount');
        $additions = collect([]);

        if ($basicSalaryItem) {
            $additions->push([
                'name' => 'Gaji Harian',
                'keterangan' => 'Total gaji dalam 1 bulan',
                'amount' => $basicSalaryItem->amount,
            ]);
        }

        if ($holidayBonusTotal > 0) {
            $additions->push([
                'name' => 'Bonus Tanggal Merah',
                'keterangan' => 'Total bonus masuk hari libur',
                'amount' => $holidayBonusTotal,
            ]);
        }

        if ($overtimeTotal > 0) {
            $additions->push([
                'name' => 'Bonus Lembur',
                'keterangan' => 'Total bonus lembur',
                'amount' => $overtimeTotal,
            ]);
        }

        $deductions = collect([]);

        if ($latePenaltyTotal > 0) {
            $deductions->push([
                'name' => 'Denda Keterlambatan',
                'keterangan' => 'Total denda keterlambatan',
                'amount' => $latePenaltyTotal,
            ]);
        }

        $periodStart = Carbon::create($payroll->year, $payroll->month, 26)->subMonth()->translatedFormat('d F Y');

        $periodEnd = Carbon::create($payroll->year, $payroll->month, 25)->translatedFormat('d F Y');

        $totalWorkDays = Attendance::where('employee_id', $payroll->employee_id)
            ->whereBetween('tanggal', [
                Carbon::create($payroll->year, $payroll->month, 26)->subMonth()->toDateString(),

                Carbon::create($payroll->year, $payroll->month, 25)->toDateString(),
            ])
            ->count();

        return inertia('payroll/slip-gaji', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
            'additions' => $additions,
            'deductions' => $deductions,
            'periodStart' => $periodStart,
            'periodEnd' => $periodEnd,
            'totalWorkDays' => $totalWorkDays,
        ]);
    }
}
