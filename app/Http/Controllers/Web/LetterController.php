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

            // Hapus kedua PDF lama
            $this->deletePdf($letter->pdf_path);
            $this->deletePdf($letter->pdf_read_path);

            $letter->update([
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'name_office' => $employee->office?->name ?? '-',
                'nomor_surat' => $validated['nomor_surat'],
                'jenis_surat' => $validated['jenis_surat'],
                'tanggal_surat' => $validated['tanggal_surat'],
                'alasan_surat' => $validated['alasan_surat'],

                // PDF harus dibuat ulang setelah surat diedit
                'pdf_path' => null,
                'pdf_read_path' => null,
                'sent_at' => null,
                'read_at' => null,
            ]);
        });

        return redirect()
            ->route('letter.index')
            ->with(
                'success',
                'Data surat berhasil diperbarui.'
            );
    }

    public function destroy(Letter $letter)
    {
        // Hapus PDF biasa
        $this->deletePdf($letter->pdf_path);

        // Hapus PDF versi sudah dibaca
        $this->deletePdf($letter->pdf_read_path);

        $letter->delete();

        return redirect()
            ->route('letter.index')
            ->with(
                'success',
                'Data surat berhasil dihapus.'
            );
    }

    // public function send(Request $request, Letter $letter)
    // {
    //     $request->validate([
    //         'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
    //         'pdf_read' => ['required', 'file', 'mimes:pdf', 'max:10240'],
    //     ]);

    //     DB::transaction(function () use ($request, $letter) {
    //         $directory = public_path('surat');

    //         if (!File::exists($directory)) {
    //             File::makeDirectory($directory, 0755, true);
    //         }

    //         $this->deletePdf($letter->pdf_path);
    //         $this->deletePdf($letter->pdf_read_path);

    //         $employeeCode = $letter->employee?->employee_code ?? 'unknown';

    //         $nomorSurat = str_replace(
    //             '/',
    //             '_',
    //             $letter->nomor_surat
    //         );

    //         $fileName = $nomorSurat . '-' . $employeeCode . '.pdf';
    //         $readFileName = $nomorSurat . '-' . $employeeCode . '-read.pdf';

    //         $request->file('pdf')->move(
    //             $directory,
    //             $fileName
    //         );

    //         $request->file('pdf_read')->move(
    //             $directory,
    //             $readFileName
    //         );

    //         $letter->update([
    //             'pdf_path' => 'surat/' . $fileName,
    //             'pdf_read_path' => 'surat/' . $readFileName,
    //             'sent_at' => now(),
    //             'read_at' => null,
    //         ]);
    //     });

    //     return redirect()
    //         ->route('letter.index')
    //         ->with(
    //             'success',
    //             'Surat berhasil dikirim dan PDF berhasil disimpan.'
    //         );
    // }


    public function send(Request $request, Letter $letter)
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'pdf_read' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $directory = public_path('surat');
        File::ensureDirectoryExists($directory);

        $oldPdfPath = $letter->pdf_path;
        $oldPdfReadPath = $letter->pdf_read_path;

        $newFiles = [];

        try {
            // Buat nama baru agar tidak menimpa file lama.
            $pdfName = 'surat_' . $letter->id . '_' . uniqid() . '.pdf';
            $pdfReadName = 'surat_read_' . $letter->id . '_' . uniqid() . '.pdf';

            // Simpan PDF biasa.
            $request->file('pdf')->move($directory, $pdfName);
            $newFiles[] = $directory . DIRECTORY_SEPARATOR . $pdfName;

            // Simpan PDF versi sudah dibaca/dicentang.
            $request->file('pdf_read')->move($directory, $pdfReadName);
            $newFiles[] = $directory . DIRECTORY_SEPARATOR . $pdfReadName;

            // Update database setelah kedua file berhasil disimpan.
            DB::transaction(function () use ($letter, $pdfName, $pdfReadName) {
                $letter->update([
                    'pdf_path' => 'surat/' . $pdfName,
                    'pdf_read_path' => 'surat/' . $pdfReadName,
                    'sent_at' => now(),
                    'read_at' => null,
                ]);
            });

            // Hapus file lama hanya setelah database berhasil diperbarui.
            foreach ([$oldPdfPath, $oldPdfReadPath] as $oldPath) {
                if (!$oldPath) {
                    continue;
                }

                $oldFile = public_path($oldPath);

                // Jangan hapus jika path lama sama dengan file baru.
                if (
                    File::exists($oldFile) &&
                    !in_array($oldFile, $newFiles, true)
                ) {
                    File::delete($oldFile);
                }
            }

            return back()->with('success', 'PDF surat berhasil diperbarui.');
        } catch (\Throwable $e) {
            // Jika gagal, bersihkan file baru yang sempat tersimpan.
            foreach ($newFiles as $newFile) {
                if (File::exists($newFile)) {
                    File::delete($newFile);
                }
            }

            logger('Gagal memperbarui PDF surat', [
                'letter_id' => $letter->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'pdf' => 'Gagal menyimpan PDF. Silakan periksa log Laravel.',
            ]);
        }
    }


    public function pdf(Letter $letter)
    {
        return Inertia::render('data-karyawan/letter/pdf', [
            'letter' => [
                'id' => $letter->id,
                'name' => $letter->name,
                'nomor_surat' => $letter->nomor_surat,
                'pdf_url' => $letter->pdf_path
                    ? asset($letter->pdf_path)
                    : null,
            ],
        ]);
    }

    // public function pdf(Letter $letter)
    // {
    //     $letter->load([
    //         'employee:id,employee_code,position_id,office_id',
    //         'employee.position:id,name',
    //         'employee.office:id,name',
    //     ]);

    //     return Inertia::render('data-karyawan/letter/pdf', [
    //         'letter' => [
    //             'id' => $letter->id,
    //             'employee_id' => $letter->employee_id,
    //             'employee_code' => $letter->employee?->employee_code,
    //             'name' => $letter->name,
    //             'jabatan' => $letter->employee?->position?->name,
    //             'nomor_surat' => $letter->nomor_surat,
    //             'jenis_surat' => $letter->jenis_surat,
    //             'tanggal_surat' => $letter->tanggal_surat
    //                 ?->locale('id')
    //                 ->translatedFormat('d F Y'),
    //             'alasan_surat' => $letter->alasan_surat,
    //             'name_office' => $letter->employee?->office?->name,
    //             'read_at' => $letter->read_at?->toISOString(),
    //         ],
    //     ]);
    // }

    private function deletePdf(?string $path): void
    {
        if (! $path) {
            return;
        }

        $fullPath = public_path($path);

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}
