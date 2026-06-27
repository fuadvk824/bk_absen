<?php

namespace App\Exports\Laporan;

use App\Http\Resources\Web\OvertimeExportResource;
use App\Models\Overtime;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

// ==============  1 file banyak karyawan ===================
class OvertimeExport implements FromArray, WithEvents
{
    protected array $rows = [];
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;

        $this->buildRows();
    }

    protected function buildRows(): void
    {
        $row = [];

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
            ->orderBy('employee_id')
            ->orderBy('date')
            ->get()
            ->groupBy('employee_id');


        foreach ($groups as $employeeOvertimes) {

            $row[] = ['REKAP LAPORAN LEMBUR'];

            $periode =
                ($this->request->start_date ?? '-') .
                ' s/d ' .
                ($this->request->end_date ?? '-');

            $row[] = ["Periode : {$periode}"];
            $row[] = [""];

            $first = new OvertimeExportResource(
                $employeeOvertimes->first()
            );

            $employee = $first->toArray(request());
            $row[] = [];

            $row[] = [
                'ID Karyawan',
                '',
                ': ' . $employee['employee_code'],
                '',
                '',
                '',
                '',
                'Kantor Cabang',
                ': ' . $employee['office_name'],
                '',
            ];

            $row[] = [
                'Nama',
                '',
                ': ' . $employee['employee_name'],
                '',
                '',
                '',
                '',
                'Jabatan',
                ': ' . $employee['position_name'],
                '',
            ];

            $row[] = [''];

            // header tabel karyawan
            $row[] = [
                'No',
                'Tanggal Pengajuan',
                'Tanggal Lembur',
                'Jam',
                '',
                'Lama Lembur',
                '',
                'Uang Lembur',
                'Pekerjaan',
                'Status',
            ];
            $row[] = [
                '',
                '',
                '',
                'Mulai',
                'Selesai',
                'Jam',
                'Menit',
                '',
                '',
                '',
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
                    $data['status'] == 'approved' ? 'Disetujui' : 'Ditolak',
                ];

                $totalMinutes += $data['minutes'];
                $totalAmount += $data['amount'];
            }
            $totalHours = floor($totalMinutes / 60);
            $remainingMinutes = $totalMinutes % 60;

            $row[] = [
                'Total',
                '',
                '',
                '',
                '',
                "{$totalHours} jam {$remainingMinutes} menit",
                $totalMinutes,
                $totalAmount,
                '',
                '',
            ];

            $row[] = [""];
            $row[] = [""];
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
                $sheet->getColumnDimension('A')->setWidth(5);
                $sheet->getColumnDimension('B')->setWidth(18);
                $sheet->getColumnDimension('C')->setWidth(18);
                $sheet->getColumnDimension('D')->setWidth(15);
                $sheet->getColumnDimension('E')->setWidth(15);
                $sheet->getColumnDimension('F')->setWidth(22);
                $sheet->getColumnDimension('G')->setWidth(22);

                $sheet->getColumnDimension('H')->setWidth(18);
                $sheet->getColumnDimension('I')->setWidth(45);
                $sheet->getColumnDimension('J')->setWidth(12);

                $highestRow = $sheet->getHighestRow();

                for ($row = 1; $row <= $highestRow; $row++) {

                    $colA = trim((string) $sheet->getCell("A{$row}")->getValue());
                    $colB = trim((string) $sheet->getCell("B{$row}")->getValue());

                    if ($colA === 'REKAP LAPORAN LEMBUR') {
                        $sheet->mergeCells("A{$row}:J{$row}");
                        $sheet->getStyle("A{$row}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $sheet->getStyle("A{$row}")
                            ->getFont()
                            ->setBold(true);
                    }


                    if (str_contains($colA, 'Periode :')) {
                        $sheet->mergeCells("A{$row}:J{$row}");
                        $sheet->getStyle("A{$row}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);

                        $nextRow = $row + 1;
                        $sheet->mergeCells("A{$nextRow}:J{$nextRow}");
                    }

                    if (
                        $colA === 'No' &&
                        $colB === 'Tanggal Pengajuan'
                    ) {
                        $sheet->mergeCells("A{$row}:A" . ($row + 1));
                        $sheet->mergeCells("B{$row}:B" . ($row + 1));
                        $sheet->mergeCells("C{$row}:C" . ($row + 1));
                        $sheet->mergeCells("H{$row}:H" . ($row + 1));
                        $sheet->mergeCells("I{$row}:I" . ($row + 1));
                        $sheet->mergeCells("J{$row}:J" . ($row + 1));
                        $sheet->mergeCells("D{$row}:E{$row}");
                        $sheet->mergeCells("F{$row}:G{$row}");

                        $sheet->getStyle("A{$row}:J" . ($row + 1))
                            ->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                    'color' => [
                                        'rgb' => '000000',
                                    ],
                                ],
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => '00FF00',
                                    ],
                                ],
                            ]);

                        $endRow = $row;
                        for ($i = $row + 1; $i <= $highestRow; $i++) {
                            $valueTotal = trim(
                                (string) $sheet->getCell("A{$i}")->getValue()
                            );
                            if ($valueTotal === 'Total') {
                                $endRow = $i;
                                break;
                            }
                        }
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
                            ])->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);;

                        $sheet->getStyle("A{$endRow}:J{$endRow}")
                            ->getFont()
                            ->setBold(true);
                        $sheet->getStyle("A{$row}:J" . ($row + 1))
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);
                    }
                    if ($colA === 'ID Karyawan') {
                        $sheet->mergeCells("A{$row}:B{$row}");
                        $sheet->mergeCells("C{$row}:D{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");
                    }
                    if ($colA === 'Nama') {
                        $sheet->mergeCells("A{$row}:B{$row}");
                        $sheet->mergeCells("C{$row}:D{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");

                        $nextRow = $row + 1;
                        $sheet->mergeCells("A{$nextRow}:J{$nextRow}");
                    }
                    if ($colA === 'Total') {
                        $sheet->mergeCells("A{$row}:E{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");

                        $sheet->getStyle("A{$row}:J{$row}")->applyFromArray([
                            'font' => [
                                'bold' => true,
                                'color' => [
                                    'rgb' => '000000',
                                ],
                            ],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => [
                                    'rgb' => 'E1C16E',
                                ],
                            ],
                        ])
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_RIGHT)
                            ->setVertical(Alignment::VERTICAL_CENTER);

                        $sheet->getStyle("A{$row}:A{$row}")->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("F{$row}:H{$row}")->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }
            },
        ];
    }
}
  