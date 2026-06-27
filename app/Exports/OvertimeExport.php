<?php

namespace App\Exports;

use App\Http\Resources\Web\OvertimeResource;
use App\Models\Overtime;
use Illuminate\Http\Request;

class OvertimeExport extends BaseExport
{
    protected string $title = 'LAPORAN DATA OFFICE';

    protected array $availableColumns = [
        'employee_name' => 'Nama Karyawan',
        'date' => 'Tanggal',
        'waktu' => 'Waktu',
        'reason' => 'Pekerjaan',
        'status' => 'Status',
        'created_at' => 'Waktu Pengajuan',
    ];

    protected function query(Request $request)
    {
        return Overtime::filter($request)->get();
    }

    protected function resource($model)
    {
        return new OvertimeResource($model);
    }
}
