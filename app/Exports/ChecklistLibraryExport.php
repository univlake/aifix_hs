<?php

namespace App\Exports;

use App\Models\ChecklistLibrary;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ChecklistLibraryExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    public function __construct(
        private int $companyId,
        private ?string $title = null,
    ) {}

    public function headings(): array
    {
        return ['序号', '检查表名称', '状态', '创建时间'];
    }

    public function collection(): Collection
    {
        return ChecklistLibrary::query()
            ->where('company_id', $this->companyId)
            ->when($this->title, fn ($q) => $q->where('title', 'like', "%{$this->title}%"))
            ->orderBy('id', 'desc')
            ->get()
            ->values()
            ->map(fn ($item, $index) => [
                $index + 1,
                $item->title,
                $item->status === 1 ? '启用' : '停用',
                $item->created_at?->format('Y-m-d'),
            ]);
    }

    public function styles(Worksheet $sheet): array
    {
        $lastCol = Coordinate::stringFromColumnIndex(count($this->headings()));

        return [
            "A1:{$lastCol}1" => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'DBEAFE']],
            ],
        ];
    }
}
