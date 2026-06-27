<?php

namespace App\Exports\Laporan;

use App\Models\Overtime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class OvertimeZipExport
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function download()
    {
        $tempDir = storage_path('app/private/temp');

        // pastikan folder ada
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        $zipName = 'laporan-lembur.zip';
        $zipPath = $tempDir . '/' . $zipName;

        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception("Gagal membuat file ZIP");
        }

        $employees = Overtime::query()
            ->with('employee')
            ->where('status', 'approved')
            ->when($this->request->office_id, function ($q) {
                $q->whereHas('employee', function ($e) {
                    $e->where('office_id', $this->request->office_id);
                });
            })
            ->when($this->request->start_date, function ($q) {
                $q->whereDate('date', '>=', $this->request->start_date);
            })
            ->when($this->request->end_date, function ($q) {
                $q->whereDate('date', '<=', $this->request->end_date);
            })
            ->get()
            ->groupBy('employee_id');

        foreach ($employees as $employeeId => $items) {

            $employeeName = $items->first()->employee->name;

            // sanitize nama file
            $safeName = preg_replace('/[\/\\\\:*?"<>|]/', '_', $employeeName);

            $excelName = "{$safeName}.xlsx";

            $relativePath = "temp/{$excelName}";

            // generate excel ke storage (disk = local => app/private)
            Excel::store(
                new OvertimeEmployeeExport($employeeId, $this->request),
                $relativePath,
                'local'
            );
            clearstatcache(true);
            sleep(1);

            // pastikan file benar-benar ada
            if (!Storage::disk('local')->exists($relativePath)) {
                throw new \Exception("File Excel tidak ditemukan: {$relativePath}");
            }

            $fullPath = Storage::disk('local')->path($relativePath);

            if (!file_exists($fullPath) || filesize($fullPath) === 0) {
                throw new \Exception("File Excel rusak/kosong: {$fullPath}");
            }

            // masukkan ke zip
            $zip->addFile($fullPath, $excelName);
        }

        $zip->close();

        return response()
            ->download($zipPath)
            ->deleteFileAfterSend(true);
    }
}
 