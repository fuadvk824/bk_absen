<?php

namespace App\Exports;

use App\Http\Resources\Web\OfficeResource;
use App\Models\Office;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping};
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Style\Fill;

use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class OfficeExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    use Exportable;

    protected array $columns;
    protected $offices;
    protected int $rowNumber = 0;

    protected array $availableColumns = [
        'no' => 'No',
        'office_code' => 'Kode Kantor',
        'name' => 'Nama Toko',
        'phone' => 'Nomor Telepon',
        'address' => 'Alamat',
        'city' => 'Kota',
        'province' => 'Provinsi',
        'poscode' => 'Kode Pos',
        'status' => 'Status',
    ];

    public function __construct(Request $request, array $columns = [])
    {
        $this->columns = $columns;

        $this->offices = Office::filter($request)->get();
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastColumn = $sheet->getHighestColumn();

                $sheet->insertNewRowBefore(1, 1);
                $sheet->setCellValue('A1', 'LAPORAN DATA OFFICE');
                $sheet->mergeCells("A1:{$lastColumn}1");

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

                $sheet->insertNewRowBefore(2, 1);
                $sheet->setCellValue('A2', 'Tanggal Export: ' . now()->format('d-m-Y'));
                $sheet->mergeCells("A2:{$lastColumn}2");

                $sheet->getStyle('A2')->applyFromArray([
                    'font' => [
                        'bold' => false,
                        'size' => 12,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle("A3:{$lastColumn}3")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '33B8FF'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],

                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);
            },
        ];
    }

    protected function getVisibleColumns(): array
    {
        if (empty($this->columns)) {
            return array_keys($this->availableColumns);
        }

        return array_values(array_intersect(array_keys($this->availableColumns), $this->columns));
    }

    public function collection()
    {
        return $this->offices;
    }

    public function headings(): array
    {
        $visibleColumns = $this->getVisibleColumns();

        $headings = collect($visibleColumns)->map(fn($column) => $this->availableColumns[$column])->toArray();

        array_unshift($headings, 'No');

        return $headings;
    }

    public function map($office): array
    {
        $resource = new OfficeResource($office);
        $data = $resource->toArray(request());
        $visibleColumns = $this->getVisibleColumns();
        $this->rowNumber++;

        $row = collect($visibleColumns)->map(fn($column) => $data[$column] ?? null)->toArray();

        array_unshift($row, $this->rowNumber);
        return $row;
    }
}
