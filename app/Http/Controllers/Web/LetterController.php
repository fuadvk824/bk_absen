<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\LetterResource;
use App\Models\Employee;
use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);

        $letters = Letter::query()
            ->with([
                'employee:id,employee_code,position_id',
                'employee.position:id,name',
            ])
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;

                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%' . $search . '%')
                        ->orWhere('nomor_surat', 'like', '%' . $search . '%');
                });
            })
            ->when($request->jenis_surat, function ($q) use ($request) {
                $q->where('jenis_surat', $request->jenis_surat);
            })
            ->latest('tanggal_surat')
            ->paginate($perPage)
            ->withQueryString();

        $employees = Employee::query()
            ->where('status', '!=', 'inactive')
            ->orderBy('name', 'asc')
            ->get([
                'id',
                'employee_code',
                'name',
            ]);

        return Inertia::render('data-karyawan/letter/index', [
            'letters' => LetterResource::collection($letters)
                ->response()
                ->getData(true),

            'employees' => $employees,

            'filters' => [
                'search' => $request->search,
                'jenis_surat' => $request->jenis_surat,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'nomor_surat' => ['required', 'string', 'max:255', 'unique:letters,nomor_surat'],
            'jenis_surat' => [
                'required',
                'in:SP1,SP2,SP3,probation,paklaring',
            ],
            'tanggal_surat' => ['required', 'date'],
            'alasan_surat' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($validated) {
            $employee = Employee::with('office:id,name')->findOrFail($validated['employee_id']);

            Letter::create([
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'name_office' => $employee->office?->name ?? '-',
                'nomor_surat' => $validated['nomor_surat'],
                'jenis_surat' => $validated['jenis_surat'],
                'tanggal_surat' => $validated['tanggal_surat'],
                'alasan_surat' => $validated['alasan_surat'],
            ]);
        });

        return redirect()
            ->route('letter.index')
            ->with('success', 'Data surat berhasil ditambahkan.');
    }

    public function update(Request $request, Letter $letter)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'nomor_surat' => [
                'required',
                'string',
                'max:255',
                'unique:letters,nomor_surat,' . $letter->id,
            ],
            'jenis_surat' => [
                'required',
                'in:SP1,SP2,SP3,probation,paklaring',
            ],
            'tanggal_surat' => ['required', 'date'],
            'alasan_surat' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($validated, $letter) {
            $employee = Employee::with('office:id,name')->findOrFail(
                $validated['employee_id']
            );

            if ($letter->pdf_path) {
                $pdfPath = public_path($letter->pdf_path);

                if (File::exists($pdfPath)) {
                    File::delete($pdfPath);
                }
            }

            $letter->update([
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'name_office' => $employee->office?->name ?? '-',
                'nomor_surat' => $validated['nomor_surat'],
                'jenis_surat' => $validated['jenis_surat'],
                'tanggal_surat' => $validated['tanggal_surat'],
                'alasan_surat' => $validated['alasan_surat'],

                'pdf_path' => null,
                'sent_at' => null,
            ]);
        });

        return redirect()
            ->route('letter.index')
            ->with('success', 'Data surat berhasil diperbarui.');
    }

    public function destroy(Letter $letter)
    {
        if ($letter->pdf_path) {
            $pdfPath = public_path($letter->pdf_path);

            if (File::exists($pdfPath)) {
                File::delete($pdfPath);
            }
        }

        $letter->delete();

        return redirect()
            ->route('letter.index')
            ->with('success', 'Data surat berhasil dihapus.');
    }

    public function send(Request $request, Letter $letter)
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        DB::transaction(function () use ($request, $letter) {
            $directory = public_path('surat');

            if (! File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            if ($letter->pdf_path) {
                $oldPath = public_path($letter->pdf_path);

                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }

            $employeeCode = $letter->employee?->employee_code ?? 'unknown';
            $nomorSurat = str_replace('/', '_', $letter->nomor_surat);
            $fileName = $nomorSurat . '-' . $employeeCode . '.pdf';

            $request->file('pdf')->move($directory, $fileName);

            $letter->update([
                'pdf_path' => 'surat/' . $fileName,
                'sent_at' => now(),
            ]);
        });

        return redirect()
            ->route('letter.index')
            ->with('success', 'Surat berhasil dikirim dan PDF berhasil disimpan.');
    }

    public function pdf(Letter $letter)
    {
        $letter->load([
            'employee:id,employee_code,position_id,office_id',
            'employee.position:id,name',
            'employee.office:id,name',
        ]);

        return Inertia::render('data-karyawan/letter/pdf', [
            'letter' => [
                'id' => $letter->id,
                'employee_id' => $letter->employee_id,
                'employee_code' => $letter->employee?->employee_code,
                'name' => $letter->name,
                'jabatan' => $letter->employee?->position?->name,
                'nomor_surat' => $letter->nomor_surat,
                'jenis_surat' => $letter->jenis_surat,
                'tanggal_surat' => $letter->tanggal_surat
                    ?->locale('id')
                    ->translatedFormat('d F Y'),
                'alasan_surat' => $letter->alasan_surat,
                'name_office' => $letter->employee?->office?->name,
            ],
        ]);
    }
}
