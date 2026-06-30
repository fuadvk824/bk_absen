<?php

namespace App\Exports;

use App\Http\Resources\Export\ExportEmployeeResource;
use App\Models\Employee;
use App\Http\Resources\Web\EmployeeResource;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping};
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Style\Fill;

use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class EmployeesExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithEvents
{
    use Exportable;

    protected array $columns;
    protected $employees;
    protected int $rowNumber = 0;

    protected array $availableColumns = [

        'employee_code' => 'Kode Karyawan',
        'name' => 'Nama',
        'email' => 'Email',
        'alamat' => 'Alamat',

        'no_telepon' => 'No Telepon',
        'jenis_kelamin' => 'Jenis Kelamin',
        'tanggal_lahir' => 'Tanggal Lahir',
        'nik' => 'NIK',
        'no_rek' => 'No Rekening',
        'pend_last' => 'Pendidikan Terakhir',

        'office' => 'Kantor',
        'department' => 'Departemen',
        'position' => 'Jabatan',
        'shift' => 'Shift',

        'tanggal_awal_kerja' => 'Tanggal Awal Kerja',
        'kontrak_mulai_tanggal' => 'Kontrak Mulai',
        'kontrak_selesai_tanggal' => 'Kontrak Selesai',
        'status' => 'Status',
    ];

    public function __construct(Request $request)
    {
        $this->employees = Employee::with([
            'user',
            'office',
            'department',
            'position',
            'shift',
        ])
            ->filter($request)
            ->get();
    }

    // public function registerEvents(): array
    // {
    //     return [
    //         AfterSheet::class => function (AfterSheet $event) {
    //             $sheet = $event->sheet->getDelegate();
    //             $lastColumn = $sheet->getHighestColumn();

    //             $sheet->insertNewRowBefore(1, 1);
    //             $sheet->setCellValue('A1', 'REKAP DATA KARYAWAN');
    //             $sheet->mergeCells("A1:{$lastColumn}1");
    //             $sheet->getStyle('A1')->applyFromArray([
    //                 'font' => [
    //                     'bold' => true,
    //                     'size' => 16,
    //                 ],
    //                 'alignment' => [
    //                     'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                     'vertical' => Alignment::VERTICAL_CENTER,
    //                 ],
    //             ]);

    //             $sheet->insertNewRowBefore(2, 1);
    //             $sheet->setCellValue(
    //                 'A2',
    //                 'Tanggal Export: ' . now()->format('d-m-Y'),
    //             );
    //             $sheet->mergeCells("A2:{$lastColumn}2");
    //             $sheet->getStyle('A2')->applyFromArray([
    //                 'font' => [
    //                     'bold' => false,
    //                     'size' => 12,
    //                 ],
    //                 'alignment' => [
    //                     'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                     'vertical' => Alignment::VERTICAL_CENTER,
    //                 ],
    //             ]);
    //             $sheet->mergeCells("A3:{$lastColumn}3");
    //             $sheet->getStyle("A4:{$lastColumn}4")->applyFromArray([
    //                 'font' => [
    //                     'bold' => true,
    //                     'color' => ['rgb' => 'FFFFFF'],
    //                 ],
    //                 'fill' => [
    //                     'fillType' => Fill::FILL_SOLID,
    //                     'startColor' => ['rgb' => '33B8FF'],
    //                 ],
    //                 'alignment' => [
    //                     'horizontal' => Alignment::HORIZONTAL_CENTER,
    //                 ],


    //             ]);
    //         },
    //     ];
    // }
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $lastColumn = $sheet->getHighestColumn();

                $sheet->insertNewRowBefore(1, 3);

                $sheet->setCellValue('A1', 'REKAP DATA KARYAWAN');
                $sheet->mergeCells("A1:{$lastColumn}1");

                $sheet->setCellValue(
                    'A2',
                    'Tanggal Export : ' . now()->format('d-m-Y')
                );
                $sheet->mergeCells("A2:{$lastColumn}2");

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle('A2')->applyFromArray([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ]);

                $sheet->getStyle("A4:{$lastColumn}4")->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FFE629'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                ]);
            },
        ];
    }

    protected function getVisibleColumns(): array
    {
        return array_keys($this->availableColumns);
    }

    public function collection()
    {
        return $this->employees;
    }

    public function headings(): array
    {
        $visibleColumns = $this->getVisibleColumns();

        $headings = collect($visibleColumns)
            ->map(fn($column) => $this->availableColumns[$column])
            ->toArray();

        array_unshift($headings, 'No');

        return $headings;
    }

    public function map($employee): array
    {
        $resource = new ExportEmployeeResource($employee);
        $data = $resource->toArray(request());
        $visibleColumns = $this->getVisibleColumns();

        $this->rowNumber++;

        $row = collect($visibleColumns)
            ->map(fn($column) => $data[$column] ?? null)
            ->toArray();

        array_unshift($row, $this->rowNumber);

        return $row;
    }
}
