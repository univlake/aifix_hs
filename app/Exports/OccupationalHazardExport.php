<?php

namespace App\Exports;

use App\Models\OccupationalHazard;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OccupationalHazardExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    public function __construct(
        private readonly int $companyId,
        private readonly ?string $name = null,
    ) {}

    public function headings(): array
    {
        return ['作业场所', '职业危害因素', '接触人数', '申报状态', '申报日期'];
    }

    public function collection(): Collection
    {
        $query = OccupationalHazard::where('company_id', $this->companyId)
            ->orderBy('id', 'desc');

        if ($this->name) {
            $query->where('name', 'like', "%{$this->name}%");
        }

        return $query->get()->map(fn (OccupationalHazard $item) => [
            $item->name,
            $item->type,
            $item->number,
            $item->is_declare,
            $item->declare_date,
        ]);
    }

    public function styles(Worksheet $sheet): array
    {
        $lastCol = Coordinate::stringFromColumnIndex(count($this->headings()));

        return [
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
