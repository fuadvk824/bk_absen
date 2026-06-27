<?php

namespace App\Exports;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\{FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents};
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\{Alignment, Border, Fill};

abstract class BaseExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    use Exportable;

    protected array $columns;
    protected $data;
    protected int $rowNumber = 0;
    protected string $title = 'LAPORAN DATA';

    protected array $availableColumns = [];

    public function __construct(Request $request, array $columns = [])
    {
        $this->columns = $columns;
        $this->data = $this->query($request);
    }

    /**
     * WAJIB di override di class turunan
     */
    abstract protected function query(Request $request);

    abstract protected function resource($model);

    public function collection()
    {
        return $this->data;
    }

    protected function getVisibleColumns(): array
    {
        if (empty($this->columns)) {
            return array_keys($this->availableColumns);
        }

        return array_values(array_intersect(array_keys($this->availableColumns), $this->columns));
    }

    public function headings(): array
    {
        $visibleColumns = $this->getVisibleColumns();

        $headings = collect($visibleColumns)->map(fn($column) => $this->availableColumns[$column])->toArray();

        array_unshift($headings, 'No');

        return $headings;
    }

    public function map($row): array
    {
        $resource = $this->resource($row);
        $data = $resource->toArray(request());
        $visibleColumns = $this->getVisibleColumns();

        $this->rowNumber++;

        $mapped = collect($visibleColumns)->map(fn($column) => $data[$column] ?? null)->toArray();

        array_unshift($mapped, $this->rowNumber);

        return $mapped;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastColumn = $sheet->getHighestColumn();

                $sheet->insertNewRowBefore(1, 1);
                $sheet->setCellValue('A1', $this->title);
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
}
