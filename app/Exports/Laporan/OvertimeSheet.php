<?php

namespace App\Exports\Laporan;

use App\Http\Resources\Web\OvertimeExportResource;
use App\Models\Overtime;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class OvertimeSheet implements
    FromArray,
    WithTitle,
    ShouldAutoSize
{
    protected int $employeeId;
    protected Request $request;

    public function __construct(
        int $employeeId,
        Request $request
    ) {
        $this->employeeId = $employeeId;
        $this->request = $request;
    }

    public function title(): string
    {
        $overtime = Overtime::with('employee')
            ->where('employee_id', $this->employeeId)
            ->first();

        return substr(
            $overtime?->employee?->name ?? 'Karyawan',
            0,
            31 // batas sheet excel
        );
    }

    public function array(): array
    {
        $rows = [];

        $rows[] = ['REKAP LAPORAN LEMBUR'];

        $overtimes = Overtime::query()
            ->with([
                'employee.office',
                'employee.position',
                'overtimeRate',
            ])
            ->where('status', 'approved')
            ->where('employee_id', $this->employeeId)
            ->when(
                $this->request->start_date,
                fn($q) => $q->whereDate(
                    'date',
                    '>=',
                    $this->request->start_date
                )
            )
            ->when(
                $this->request->end_date,
                fn($q) => $q->whereDate(
                    'date',
                    '<=',
                    $this->request->end_date
                )
            )
            ->orderBy('date')
            ->get();

        if ($overtimes->isEmpty()) {
            return $rows;
        }

        $employee = (
            new OvertimeExportResource(
                $overtimes->first()
            )
        )->toArray(request());

        $rows[] = [];
        $rows[] = ['ID Karyawan', $employee['employee_code']];
        $rows[] = ['Nama', $employee['employee_name']];
        $rows[] = ['Kantor', $employee['office_name']];
        $rows[] = ['Jabatan', $employee['position_name']];
        $rows[] = [];

        $rows[] = [
            'No',
            'Tanggal Pengajuan',
            'Tanggal Lembur',
            'Jam Mulai',
            'Jam Selesai',
            'Lama Lembur',
            'Menit',
            'Uang Lembur',
            'Pekerjaan',
            'Status',
        ];

        $no = 1;
        $totalMinutes = 0;
        $totalAmount = 0;

        foreach ($overtimes as $item) {

            $data = (
                new OvertimeExportResource($item)
            )->toArray(request());

            $rows[] = [
                $no++,
                $data['created_at'],
                $data['date'],
                $data['time_from'],
                $data['time_to'],
                $data['hours'],
                $data['minutes'],
                $data['amount'],
                $data['reason'],
                $data['status'],
            ];

            $totalMinutes += $data['minutes'];
            $totalAmount += $data['amount'];
        }

        $rows[] = [
            '',
            '',
            '',
            '',
            'TOTAL',
            floor($totalMinutes / 60) . ' jam ' . ($totalMinutes % 60) . ' menit',
            $totalMinutes,
            $totalAmount,
        ];

        return $rows;
    }
}
