<?php

namespace App\Exports;

use App\Http\Resources\Web\ShiftResource;
use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftExport implements BaseExport
{
    protected string $title = 'LAPORAN DATA SHIFT';

    protected array $availableColumns = [
        'shift_code' => 'Kode Shift',
        'name_shift' => 'Nama Shift',
        'toleransi_late' => 'Toleransi Keterlambatan',
        'denda_alpha' => 'Denda'
    ];

    protected function query(Request $request)
    {
        return Shift::filter($request)->get();
    }

    protected function resource($model)
    {
        return new ShiftResource($model);
    }
}
