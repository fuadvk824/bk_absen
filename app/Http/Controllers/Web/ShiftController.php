<?php

namespace App\Http\Controllers\Web;

use App\Exports\ShiftExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ShiftRequest;
use App\Http\Resources\Web\ShiftResource;
use App\Models\Employee;
use App\Models\Shift;
use App\Services\CodeGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $shifts = Shift::filter($request)->paginate($perPage)->withQueryString();

        return Inertia::render('data-karyawan/shift-karyawan/index', [
            'shifts' => ShiftResource::collection($shifts)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        $days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

        return Inertia::render('data-karyawan/shift-karyawan/create', [
            'days' => $days,
        ]);
    }

    public function store(ShiftRequest $request, CodeGeneratorService $codeService)
    {
        $validated = $request->validated();
        DB::transaction(function () use ($validated, $codeService) {
            $code = $codeService->generate(Shift::class, 'shift_code', 'SHF', 3);

            $shift = Shift::create([
                'shift_code' => $code,
                'name_shift' => $validated['name_shift'],
                'toleransi_late' => $validated['toleransi_late'],
                'denda_alpha' => $validated['denda_alpha'],
            ]);

            $now = now();

            $details = collect($validated['shift_details'])
                ->map(function ($detail) use ($shift, $now) {
                    return [
                        'shift_id' => $shift->id,
                        'day_of_week' => $detail['day_of_week'],
                        'checkin_time' => $detail['checkin_time'] ?? null,
                        'checkout_time' => $detail['checkout_time'] ?? null,
                        'breaktime_start' => $detail['breaktime_start'] ?? null,
                        'breaktime_end' => $detail['breaktime_end'] ?? null,
                        'is_active' => $detail['is_active'] ?? false,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                })
                ->toArray();

            DB::table('shift_details')->insert($details);
        });

        return redirect()->route('shift.index')->with('success', 'Shift berhasil ditambahkan');
    }

    public function edit(Shift $shift)
    {
        $shift = $shift->load('shiftDetails');

        return Inertia::render('data-karyawan/shift-karyawan/edit', [
            'shift' => $shift,
        ]);
    }

    public function update(ShiftRequest $request, Shift $shift)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $shift) {
            $shift->update([
                'name_shift' => $validated['name_shift'],
                'toleransi_late' => $validated['toleransi_late'],
                'denda_alpha' => $validated['denda_alpha'],
            ]);

            foreach ($validated['shift_details'] as $detail) {
                $shift->shiftDetails()->updateOrCreate(
                    ['day_of_week' => $detail['day_of_week']],
                    [
                        'checkin_time' => $detail['checkin_time'] ?? null,
                        'checkout_time' => $detail['checkout_time'] ?? null,
                        'breaktime_start' => $detail['breaktime_start'] ?? null,
                        'breaktime_end' => $detail['breaktime_end'] ?? null,
                        'is_active' => $detail['is_active'],
                    ],
                );
            }
        });

        return redirect()->route('shift.index')->with('success', 'Shift berhasil diperbarui');
    }

    public function destroy(Shift $shift)
    {
        DB::transaction(function () use ($shift) {
            $shift->delete();
        });

        $employee = Employee::query()->where('shift_id', $shift->id);
        $employee->update(['shift_id' => null]);

        return redirect()->route('shift.index')->with('success', 'Data shift berhasil dihapus');
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);
        return Excel::download(new ShiftExport($request, $columns), 'shift.xlsx');
    }
}
