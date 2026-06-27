<?php

namespace App\Http\Controllers\Web;

use App\Exports\OfficeExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\OfficeRequest;
use App\Http\Resources\Web\OfficeResource;
use App\Models\Office;
use App\Services\CodeGeneratorService;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class OfficeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $offices = Office::filter($request)->paginate($perPage)->withQueryString();

        return Inertia::render('kantor/kantor/index', [
            'offices' => OfficeResource::collection($offices)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'timezone' => $request->timezone,
                'status' => $request->status,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('kantor/kantor/create');
    }

    public function store(OfficeRequest $request, CodeGeneratorService $codeService, ImageUploadService $imageService)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $codeService, $imageService) {
            $code = $codeService->generate(Office::class, 'office_code', 'OFC', 3);

            $imagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $imageService->upload($request->file('image'), 'ofc', $code, 'office');
            }

            Office::create([
                'name' => $validated['name'],
                'office_code' => $code,
                'address' => $validated['address'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'poscode' => $validated['poscode'],
                'phone' => $validated['phone'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'radius_meter' => $validated['radius_meter'] ?? 20,

                'status' => $validated['status'],
                'image' => $imagePath,
                'timezone' => $validated['timezone'],
            ]);
        });

        return redirect()->route('office.index')->with('success', 'Kantor berhasil ditambahkan.');
    }

    public function edit(Office $office)
    {
        return inertia('kantor/kantor/edit', [
            'office' => $office,
        ]);
    }

    public function update(OfficeRequest $request, Office $office, ImageUploadService $imageService)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $office, $imageService) {
            $imagePath = $office->image;

            if ($request->hasFile('image')) {
                $imagePath = $imageService->upload(
                    $request->file('image'),
                    $office->office_code,
                    $office->office_code,
                    'office',
                    $office->image
                );
            }

            $office->update([
                'name' => $validated['name'],
                'address' => $validated['address'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'poscode' => $validated['poscode'] ?? null,

                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'radius_meter' => $validated['radius_meter'] ?? 20,

                'status' => $validated['status'],
                'image' => $imagePath,
                'timezone' => $validated['timezone'],
            ]);
        });

        return redirect()->route('office.index')->with('success', 'Office berhasil diperbarui');
    }

    public function destroy(Office $office)
    {
        if ($office) {
            $office->delete();
        }

        return redirect()->route('office.index')->with('success', 'Kantor berhasil dihapus');
    }

    public function export(Request $request)
    {
        $columns = $request->input('columns', []);
        return Excel::download(new OfficeExport($request, $columns), 'office.xlsx');
    }
}
