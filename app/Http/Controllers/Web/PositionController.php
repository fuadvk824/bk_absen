<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\PositionResource;
use App\Models\Position;
use App\Services\CodeGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $positions = Position::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kantor/jabatan/index', [
            'positions' => PositionResource::collection($positions)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
            ],
        ]);
    }
    public function create()
    {
        return Inertia::render('kantor/jabatan/create');
    }

    public function store(Request $request, CodeGeneratorService $codeService)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $codeService) {
            $code = $codeService->generate(Position::class, 'position_code', 'PST', 3);

            Position::create([
                'name' => $validated['name'],
                'position_code' => $code,
            ]);
        });

        return redirect()->route('position.index')->with('success', 'Data jabatan berhasil ditambahkan.');
    }

    public function edit(Position $position)
    {
        return inertia('kantor/jabatan/edit', [
            'position' => $position,
        ]);
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $position) {
            $position->update([
                'name' => $validated['name'],
            ]);
        });

        return redirect()->route('position.index')->with('success', 'Data jabatan berhasil diperbarui');
    }

    public function destroy(Position $position)
    {
        if ($position) {
            $position->delete();
        }

        return redirect()->route('position.index')->with('success', 'Data jabatan berhasil dihapus');
    }
}
