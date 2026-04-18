<?php

namespace App\Exports;

use App\Models\HealthFile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class HealthFileExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    public function __construct(
        private readonly int $companyId,
        private readonly ?string $name = null,
    ) {}

    public function headings(): array
    {
        return ['姓名', '工号', '部门', '岗位', '体检日期', '体检结论', '复查情况', '处理意见', '处理结果'];
    }

    public function collection(): Collection
    {
        $query = HealthFile::where('company_id', $this->companyId)
            ->orderBy('id', 'desc');

        if ($this->name) {
            $query->where('name', 'like', "%{$this->name}%");
        }

        return $query->get()->map(fn (HealthFile $item) => [
            $item->name,
            $item->number,
            $item->department,
            $item->post,
            $item->checkup_date,
            $item->checkup_expiry,
            $item->review_situation,
            $item->handling_opinions,
            $item->process_result,
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
