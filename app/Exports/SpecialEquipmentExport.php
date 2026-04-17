<?php

namespace App\Exports;

use App\Models\SpecialEquipment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SpecialEquipmentExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    public function __construct(
        private readonly int $companyId,
        private readonly ?string $equipmentName = null,
        private readonly ?int $specialTypeId = null,
    ) {}

    public function headings(): array
    {
        return [
            '设备名称', '设备类型', '使用位置', '使用证编号/场内机动车牌证',
            '规格型号一', '规格型号二', '规格型号三', '规格型号四',
            '投用时间', '检验有效期', '检验单位', '维护信息', '备注',
        ];
    }

    public function collection(): Collection
    {
        $query = SpecialEquipment::with('specialType')
            ->where('company_id', $this->companyId)
            ->orderBy('id', 'desc');

        if ($this->equipmentName) {
            $query->where('equipment_name', 'like', "%{$this->equipmentName}%");
        }
        if ($this->specialTypeId) {
            $query->where('special_type_id', $this->specialTypeId);
        }

        return $query->get()->map(fn (SpecialEquipment $item) => [
            $item->equipment_name,
            $item->specialType?->title,
            $item->utilized_location,
            $item->serial_number,
            $item->norm_model1,
            $item->norm_model2,
            $item->norm_model3,
            $item->norm_model4,
            $item->use_time,
            $item->valid_period,
            $item->inspect_unit,
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
