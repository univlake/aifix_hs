<?php

namespace App\Exports;

use App\Models\DangerousEquipment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DangerousEquipmentExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    public function __construct(
        private readonly int $companyId,
        private readonly ?string $equipmentName = null,
    ) {}

    public function headings(): array
    {
        return [
            '设备名称', '使用位置', '规格型号', '使用证编号',
            '投用时间', '自动化程度', '维护信息', '备注',
        ];
    }

    public function collection(): Collection
    {
        $query = DangerousEquipment::where('company_id', $this->companyId)
            ->orderBy('id', 'desc');

        if ($this->equipmentName) {
            $query->where('equipment_name', 'like', "%{$this->equipmentName}%");
        }

        return $query->get()->map(fn (DangerousEquipment $item) => [
            $item->equipment_name,
            $item->utilized_location,
            $item->norm_model,
            $item->serial_number,
            $item->use_time,
            $item->automation_type,
            $item->maintain_info,
            $item->comment,
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
