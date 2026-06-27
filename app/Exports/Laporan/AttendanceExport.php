<?php

namespace App\Exports\Laporan;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\WorkScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AttendanceExport implements FromArray, WithEvents
{
    protected array $rows = [];
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;

        $this->buildRows();
    }

    private function formatDuration(int $seconds): string
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }

    protected function buildRows(): void
    {
        $row = [];

        $scheduleGroups = WorkScheduleDay::query()
            ->select([
                'id',
                'work_schedule_id',
                'shift_id',
                'work_date',
                'is_off',
            ])
            ->with([
                'shift:id,name_shift',
                'workSchedule:id,employee_id',
                'workSchedule.employee:id,employee_code,name,office_id,position_id',
                'workSchedule.employee.office:id,name',
                'workSchedule.employee.position:id,name',
            ])

            ->whereHas('workSchedule', function ($q) {
                $q->when(
                    $this->request->office_id,
                    fn($qq) => $qq->whereHas(
                        'employee',
                        fn($e) => $e->where(
                            'office_id',
                            $this->request->office_id
                        )
                    )
                );
            })
            ->when(
                $this->request->start_date,
                fn($q) => $q->whereDate(
                    'work_date',
                    '>=',
                    $this->request->start_date
                )
            )
            ->when(
                $this->request->end_date,
                fn($q) => $q->whereDate(
                    'work_date',
                    '<=',
                    $this->request->end_date
                )
            )
            ->orderBy('work_date')
            ->get()
            ->groupBy(fn($item) => $item->workSchedule->employee_id);

        $attendances = Attendance::query()
            ->select([
                'employee_id',
                'tanggal',
                'check_in',
                'check_out',
                'checkin_time',
                'checkout_time',
                'toleransi_late',
                'late_minutes',
                'late_reason',
                'early_reason',
            ])
            ->when(
                $this->request->start_date,
                fn($q) => $q->whereDate(
                    'tanggal',
                    '>=',
                    $this->request->start_date
                )
            )
            ->when(
                $this->request->end_date,
                fn($q) => $q->whereDate(
                    'tanggal',
                    '<=',
                    $this->request->end_date
                )
            )
            ->get()
            ->keyBy(fn($item) => $item->employee_id . '_' . $item->tanggal);

        $leaves = Leave::query()
            ->with('leaveCategory:id,leave_name')
            ->where('status', 'approved')
            ->when(
                $this->request->start_date,
                fn($q) => $q->whereDate(
                    'end_date',
                    '>=',
                    $this->request->start_date
                )
            )
            ->when(
                $this->request->end_date,
                fn($q) => $q->whereDate(
                    'start_date',
                    '<=',
                    $this->request->end_date
                )
            )
            ->get()
            ->groupBy('employee_id');



        foreach ($scheduleGroups as $employeeSchedules) {

            $firstSchedule = $employeeSchedules->first();
            $employee = $firstSchedule->workSchedule->employee;

            $row[] = ['REKAP LAPORAN ABSENSI'];

            $periode =
                ($this->request->start_date ?? '-') .
                ' s/d ' .
                ($this->request->end_date ?? '-');

            $row[] = ["Periode : {$periode}"];
            $row[] = [''];
            $row[] = [
                'ID Karyawan',
                '',
                ': ' . $employee->employee_code,
                '',
                '',
                '',
                '',
                '',
                'Kantor Cabang',
                '',
                ': ' . ($employee->office?->name ?? '-'),
                '',
            ];

            $row[] = [
                'Nama',
                '',
                ': ' . $employee->name,
                '',
                '',
                '',
                '',
                '',
                'Jabatan',
                '',
                ': ' . ($employee->position?->name ?? '-'),
                '',
            ];

            $row[] = [''];

            $row[] = [
                'No',
                'Tanggal',
                'Status',
                'Masuk',
                '',
                '',
                '',
                '',

                'Pulang',
                '',
                '',
                '',
            ];
            $row[] = [
                '',
                '',
                '',

                'Waktu Check-In',
                'Jam Masuk',
                'Terlambat Tanpa Toleransi',
                'Terlambat Dengan Toleransi',
                'Alasan Terlambat',

                'Waktu Check-Out',
                'Jam Pulang',
                'Pulang Cepat',
                'Alasan Pulang Cepat',
            ];

            $no = 1;
            $totalLate = 0;
            $totalHadir = 0;
            $totalAlpha = 0;
            $totalLibur = 0;
            $totalLeave = 0;
            $totalLateWithoutToleranceCount = 0;
            $totalLateWithToleranceCount = 0;
            $totalEarlyLeaveCount = 0;

            $totalLateWithoutToleranceSeconds = 0;
            $totalLateWithToleranceSeconds = 0;
            $totalEarlyLeaveSeconds = 0;

            foreach ($employeeSchedules as $schedule) {

                $key =
                    $employee->id .
                    '_' .
                    $schedule->work_date;

                $attendance = $attendances->get($key);

                $lateWithoutTolerance = '00:00:00';
                $lateWithTolerance = '00:00:00';
                $earlyLeave = '00:00:00';

                if (
                    !$schedule->is_off &&
                    $attendance &&
                    $attendance->check_in &&
                    $attendance->checkin_time
                ) {

                    $scheduleCheckin = Carbon::parse(
                        $attendance->checkin_time
                    );

                    $actualCheckin = Carbon::parse(
                        $attendance->check_in
                    );

                    if ($actualCheckin->gt($scheduleCheckin)) {

                        $diffMinutes = $scheduleCheckin
                            ->diffInMinutes($actualCheckin);

                        $diffSeconds = $scheduleCheckin
                            ->diffInSeconds($actualCheckin);

                        if ($diffMinutes > $attendance->toleransi_late) {

                            $lateWithoutTolerance = $this->formatDuration(
                                $diffSeconds
                            );

                            $totalLateWithoutToleranceSeconds += $diffSeconds;
                            $totalLateWithoutToleranceCount++;
                        } else {

                            $lateWithTolerance = $this->formatDuration(
                                $diffSeconds
                            );

                            $totalLateWithToleranceSeconds += $diffSeconds;
                            $totalLateWithToleranceCount++;
                        }
                    }
                }

                if (
                    !$schedule->is_off &&
                    $attendance &&
                    $attendance->check_out &&
                    $attendance->checkout_time
                ) {

                    $scheduleCheckout = Carbon::parse(
                        $attendance->checkout_time
                    );

                    $actualCheckout = Carbon::parse(
                        $attendance->check_out
                    );

                    if ($actualCheckout->lt($scheduleCheckout)) {

                        $earlyLeaveSeconds = $actualCheckout
                            ->diffInSeconds($scheduleCheckout);

                        $earlyLeave = $this->formatDuration(
                            $earlyLeaveSeconds
                        );

                        $totalEarlyLeaveSeconds += $earlyLeaveSeconds;
                        $totalEarlyLeaveCount++;
                    }
                }

                $employeeLeaves = $leaves->get($employee->id, collect());

                $leave = $employeeLeaves->first(function ($leave) use ($schedule) {

                    return Carbon::parse($schedule->work_date)->between(
                        Carbon::parse($leave->start_date),
                        Carbon::parse($leave->end_date)
                    );
                });


                $statusAbsen = 'HADIR';

                if ($schedule->is_off) {
                    $statusAbsen = 'LIBUR';
                    $totalLibur++;
                } elseif ($leave) {
                    $statusAbsen = $leave->leaveCategory?->name ?? 'CUTI';
                    $totalLeave++;
                } elseif (!$attendance) {
                    $statusAbsen = 'ALPHA';
                    $totalAlpha++;
                } else {
                    $statusAbsen = 'HADIR';
                    $totalHadir++;
                    $totalLate += $attendance->late_minutes;
                }

                $row[] = [
                    $no++,
                    Carbon::parse($schedule->work_date)->format('d-m-Y'),
                    $statusAbsen,

                    $attendance?->check_in ?? '-',
                    $attendance?->checkin_time ?? '-',
                    $lateWithoutTolerance !== '00:00:00' ? $lateWithoutTolerance : '-',
                    $lateWithTolerance !== '00:00:00' ? $lateWithTolerance : '-',
                    $attendance?->late_reason ?? '-',

                    $attendance?->check_out ?? '-',
                    $attendance?->checkout_time ?? '-',
                    $earlyLeave !== '00:00:00' ? $earlyLeave : '-',
                    $attendance?->early_reason ?? '-',
                ];
            }

            $row[] = [
                'Total',
                '',
                '',

                '',
                '',
                $this->formatDuration($totalLateWithoutToleranceSeconds),
                $this->formatDuration($totalLateWithToleranceSeconds),
                '',

                '',
                '',
                $this->formatDuration($totalEarlyLeaveSeconds),
                '',
            ];
            $row[] = [''];


            $row[] = [
                '',
                '',
                'Keterangan',
                'Jumlah',
                '',
                'Keterangan',
                'Jumlah',
                '',
                '',
                '',
                '',
                '',

            ];

            $row[] = [
                '',
                '',
                'Hadir',
                $totalHadir,
                '',
                'Terlambat Tanpa Toleransi',
                $totalLateWithoutToleranceCount,
                '',
                '',
                '',
                '',
                '',
            ];

            $row[] = [
                '',
                '',
                'Cuti',
                $totalLeave,
                '',
                'Terlambat Dengan Toleransi',
                $totalLateWithToleranceCount,
                '',
                '',
                '',
                '',
                '',
            ];

            $row[] = [
                '',
                '',
                'Alpha',
                $totalAlpha,
                '',
                'Pulang Cepat',
                $totalEarlyLeaveCount,
                '',
                '',
                '',
                '',
                '',
            ];

            $row[] = [
                '',
                '',
                'Libur',
                $totalLibur,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
            ];

            $row[] = [''];
            $row[] = [''];
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
                $sheet->getColumnDimension('c')->setWidth(18);

                $sheet->getColumnDimension('D')->setWidth(18);
                $sheet->getColumnDimension('E')->setWidth(15);
                $sheet->getColumnDimension('F')->setWidth(30);
                $sheet->getColumnDimension('G')->setWidth(30);
                $sheet->getColumnDimension('H')->setWidth(30);
                $sheet->getColumnDimension('I')->setWidth(18);
                $sheet->getColumnDimension('J')->setWidth(15);
                $sheet->getColumnDimension('K')->setWidth(30);
                $sheet->getColumnDimension('L')->setWidth(30);

                $highestRow = $sheet->getHighestRow();
                for ($row = 1; $row <= $highestRow; $row++) {
                    $colA = trim((string) $sheet->getCell("A{$row}")->getValue());
                    $colB = trim((string) $sheet->getCell("B{$row}")->getValue());
                    $colC = trim((string) $sheet->getCell("C{$row}")->getValue());
                    $colD = trim((string) $sheet->getCell("D{$row}")->getValue());

                    if ($colA === 'REKAP LAPORAN ABSENSI') {
                        $sheet->mergeCells("A{$row}:L{$row}");
                        $sheet->getStyle("A{$row}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $sheet->getStyle("A{$row}")
                            ->getFont()
                            ->setBold(true);
                    }
                    if (str_contains($colA, 'Periode :')) {
                        $sheet->mergeCells("A{$row}:L{$row}");
                        $sheet->getStyle("A{$row}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);

                        $nextRow = $row + 1;
                        $sheet->mergeCells("A{$nextRow}:L{$nextRow}");
                    }

                    if (
                        $colA === 'No' &&
                        $colB === 'Tanggal'
                    ) {
                        $sheet->mergeCells("A{$row}:A" . ($row + 1));
                        $sheet->mergeCells("B{$row}:B" . ($row + 1));
                        $sheet->mergeCells("C{$row}:C" . ($row + 1));
                        $sheet->mergeCells("D{$row}:H{$row}");
                        $sheet->mergeCells("I{$row}:L{$row}");

                        $sheet->getStyle("A{$row}:L" . ($row + 1))
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
                        $sheet->getStyle("A{$row}:L{$endRow}")
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

                        $sheet->getStyle("A{$endRow}:L{$endRow}")
                            ->getFont()
                            ->setBold(true);
                        $sheet->getStyle("A{$row}:L" . ($row + 1))
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);
                    }

                    if ($colA === 'ID Karyawan') {
                        $sheet->mergeCells("A{$row}:B{$row}");
                        $sheet->mergeCells("C{$row}:D{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");
                        $sheet->mergeCells("K{$row}:L{$row}");
                    }
                    if ($colA === 'Nama') {
                        $sheet->mergeCells("A{$row}:B{$row}");
                        $sheet->mergeCells("C{$row}:D{$row}");
                        $sheet->mergeCells("I{$row}:J{$row}");
                        $sheet->mergeCells("K{$row}:L{$row}");

                        $nextRow = $row + 1;
                        $sheet->mergeCells("A{$nextRow}:L{$nextRow}");
                    }

                    if ($colA === 'Total') {
                        $sheet->mergeCells("A{$row}:E{$row}");
                        $sheet->mergeCells("H{$row}:J{$row}");

                        $sheet->getStyle("A{$row}:L{$row}")->applyFromArray([
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
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                            ->setVertical(Alignment::VERTICAL_CENTER);
                    }

                    if ($colC === 'ALPHA') {
                        $sheet->getStyle("A{$row}:C{$row}")
                            ->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => 'FF0000',
                                    ],
                                ],
                            ]);
                    }
                    if ($colC === 'LIBUR') {
                        $sheet->getStyle("A{$row}:C{$row}")
                            ->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => '999999',
                                    ],
                                ],
                            ]);
                    }
                    if ($colC === 'CUTI') {
                        $sheet->getStyle("A{$row}:C{$row}")
                            ->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => 'FFFF00',
                                    ],
                                ],
                            ]);
                    }

                    if ($colC === 'Keterangan' && $colD === 'Jumlah') {


                        $sheet->getStyle("C{$row}:D{$row}")
                            ->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                ],
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => 'E1C16E',
                                    ],
                                ],
                                'alignment' => [
                                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                                    'vertical' => Alignment::VERTICAL_CENTER,
                                ],
                            ]);
                        $sheet->getStyle("F{$row}:G{$row}")
                            ->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                ],
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => [
                                        'rgb' => 'E1C16E',
                                    ],
                                ],
                                'alignment' => [
                                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                                    'vertical' => Alignment::VERTICAL_CENTER,
                                ],
                            ]);


                        $blocks = [
                            ['C', 'D'],
                            ['F', 'G'],
                        ];
                        for ($i = $row; $i <= $row + 4; $i++) {

                            foreach ($blocks as $block) {
                                [$start, $end] = $block;

                                $sheet->getStyle("{$start}{$i}:{$end}{$i}")
                                    ->applyFromArray([
                                        'borders' => [
                                            'allBorders' => [
                                                'borderStyle' => Border::BORDER_THIN,
                                                'color' => ['rgb' => '000000'],
                                            ],
                                        ],
                                        'alignment' => [
                                            'vertical' => Alignment::VERTICAL_CENTER,
                                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                                        ],
                                    ]);
                            }
                        }
                    }
                }
            }
        ];
    }
}
