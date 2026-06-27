<?php

namespace App\Http\Controllers\Web;

use App\Exports\Laporan\AttendanceExport;
use App\Exports\Laporan\OvertimeExport;
use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function overtimeReport()
    {
        return Inertia::render(
            'laporan/overtime-report',
            [
                'offices' => Office::select(
                    'id',
                    'name'
                )->get(),
            ]
        );
    }
    public function overtimeExport(Request $request)
    {
        $date = now()->format('d-m-Y');

        return Excel::download(
            new OvertimeExport($request),
            "Laporan Lembur {$date}.xlsx"
        );
    }


    public function attendanceReport()
    {
        return Inertia::render(
            'laporan/attendance-report',
            [
                'offices' => Office::select(
                    'id',
                    'name'
                )->get(),
            ]
        );
    }
    public function attendanceExport(Request $request)
    {
        $date = now()->format('d-m-Y');

        return Excel::download(
            new AttendanceExport($request),
            "Laporan Absensi {$date}.xlsx"
        );
    }
}
