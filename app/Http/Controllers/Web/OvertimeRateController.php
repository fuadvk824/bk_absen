<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\OvertimeRateResource;
use App\Models\OvertimeRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OvertimeRateController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $overtimeRates = OvertimeRate::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/lembur/index', [
            'overtimeRates' => OvertimeRateResource::collection($overtimeRates)
                ->response()
                ->getData(true),

            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
            'rate_per_hour' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            OvertimeRate::create($validated);
        });

        return redirect()
            ->route('overtime-rate.index')
            ->with('success', 'Data tarif lembur berhasil ditambahkan.');
    }

    public function update(Request $request, OvertimeRate $overtimeRate)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
            'rate_per_hour' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $overtimeRate) {
            $overtimeRate->update($validated);
        });

        return redirect()
            ->route('overtime-rate.index')
            ->with('success', 'Data tarif lembur berhasil diperbarui.');
    }

    public function destroy(OvertimeRate $overtimeRate)
    {
        $overtimeRate->delete();

        return redirect()
            ->route('overtime-rate.index')
            ->with('success', 'Data tarif lembur berhasil dihapus.');
    }
}