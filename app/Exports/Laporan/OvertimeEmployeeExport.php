<?php

namespace App\Exports\Laporan;

use App\Http\Resources\Web\OvertimeExportResource;
use App\Models\Overtime;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;


// ==============  1 file banyak karyawan ===================
class OvertimeEmployeeExport implements FromArray, WithEvents, ShouldAutoSize
{
    protected int $employeeId;
    protected Request $request;
    protected array $rows = [];

    public function __construct(
        int $employeeId,
        Request $request
    ) {
        $this->employeeId = $employeeId;
        $this->request = $request;

        $this->buildRows();
    }

    protected function buildRows(): void
    {
        $row = [];

        $row[] = ['REKAP LAPORAN LEMBUR'];

        $periode =
            ($this->request->start_date ?? '-') .
            ' s/d ' .
            ($this->request->end_date ?? '-');

        $row[] = ["Periode : {$periode}"];
        $row[] = [];
        $row[] = [""];

        $groups = Overtime::query()
            ->with([
                'employee.office',
                'employee.position',
                'overtimeRate',
            ])
            ->where('status', 'approved')
            ->when(
                $this->request->office_id,
                fn($q) => $q->whereHas(
                    'employee',
                    fn($e) => $e->where(
                        'office_id',
                        $this->request->office_id
                    )
                )
            )
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
            ->where('employee_id', $this->employeeId)
            ->orderBy('date')
            ->get()
            ->groupBy('employee_id');


        foreach ($groups as $employeeOvertimes) {

            $first = new OvertimeExportResource(
                $employeeOvertimes->first()
            );

            $employee = $first->toArray(request());
            $row[] = [''];

            $row[] = [
                'ID Karyawan',
                ': ' . $employee['employee_code'],
                '',
                '',
                '',
                '',
                '',
                '',
                'Kantor Cabang',
                ': ' . $employee['office_name'],
            ];

            $row[] = [
                'Nama',
                ': ' . $employee['employee_name'],
                '',
                '',
                '',
                '',
                '',
                '',
                'Jabatan',
                ': ' . $employee['position_name'],
            ];

            $row[] = [];

            // header tabel karyawan
            $row[] = [
                'No',
                'Tanggal Pengajuan',
                'Tanggal Lembur',
                'Jam Mulai',
                'Jam Selesai',
                'Lama Lembur (jam)',
                'Lama Lembur (menit)',
                'UANG LEMBUR',
                'Pekerjaan',
                'Status',
            ];

            $no = 1;

            $totalMinutes = 0;
            $totalAmount = 0;

            foreach ($employeeOvertimes as $item) {

                $data = (
                    new OvertimeExportResource($item)
                )->toArray(request());

                $row[] = [
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
            $totalHours = floor($totalMinutes / 60);
            $remainingMinutes = $totalMinutes % 60;

            $row[] = [
                '',
                '',
                '',
                '',
                'Total',
                "{$totalHours} jam {$remainingMinutes} menit",
                $totalMinutes,
                $totalAmount,
            ];

            $row[] = [];
            $row[] = [];
        }

        $this->rows = $row;
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $sheet->mergeCells('A1:J1');
                $sheet->mergeCells('A2:J2');

                $sheet->getStyle('A1:J2')
                    ->getAlignment()
                    ->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );

                $sheet->getStyle('A1')
                    ->getFont()
                    ->setBold(true)
                    ->setSize(16);

                $sheet->mergeCells('A3:J3');
                $sheet->mergeCells('A4:J4');

                $highestRow = $sheet->getHighestRow();

                for ($row = 1; $row <= $highestRow; $row++) {

                    $colA = trim((string) $sheet->getCell("A{$row}")->getValue());
                    $colB = trim((string) $sheet->getCell("B{$row}")->getValue());
                    $colE = trim((string) $sheet->getCell("E{$row}")->getValue());

                    if (
                        $colA === 'No' &&
                        $colB === 'Tanggal Pengajuan'
                    ) {

                        $sheet->getStyle("A{$row}:J{$row}")
                            ->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                    'color' => [
                                        'rgb' => 'FFFFFF',
                                    ],
                                ],
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => '4472C4',
                                    ],
                                ],
                            ]);

                        // Cari baris TOTAL untuk grup ini
                        $endRow = $row;

                        for ($i = $row + 1; $i <= $highestRow; $i++) {

                            $valueTotal = trim(
                                (string) $sheet->getCell("E{$i}")->getValue()
                            );

                            if ($valueTotal === 'Total') {
                                $endRow = $i;
                                break;
                            }
                        }

                        // Border dari header sampai total
                        $sheet->getStyle("A{$row}:J{$endRow}")
                            ->applyFromArray([
                                'borders' => [
                                    'allBorders' => [
                                        'borderStyle' => Border::BORDER_THIN,
                                        'color' => [
                                            'rgb' => '000000',
                                        ],
                                    ],
                                ],
                            ]);

                        // Tebalkan baris total
                        $sheet->getStyle("A{$endRow}:J{$endRow}")
                            ->getFont()
                            ->setBold(true);
                    }

                    if ($colE === 'Total') {
                        $sheet->mergeCells("A{$row}:E{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");
                    }
                }
            },
        ];
    }
}
