<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StaffTemplateExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    /**
     * @param  string[]  $headings  Column header labels
     * @param  array[]  $examples  Example data rows (array of arrays)
     */
    public function __construct(
        private readonly array $headings,
        private readonly array $examples = [],
    ) {}

    public function headings(): array
    {
        return $this->headings;
    }

    public function array(): array
    {
        return $this->examples;
    }

    public function styles(Worksheet $sheet): array
    {
        $lastCol = Coordinate::stringFromColumnIndex(count($this->headings));

        return [
            // Bold + background for header row
            "A1:{$lastCol}1" => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'DBEAFE'],
                ],
            ],
        ];
    }
}
