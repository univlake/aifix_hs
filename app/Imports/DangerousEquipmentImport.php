<?php

namespace App\Imports;

use App\Models\DangerousEquipment;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class DangerousEquipmentImport implements SkipsEmptyRows, ToCollection, WithStartRow
{
    public function __construct(
        private readonly int $companyId,
        private readonly int $userId = 0,
    ) {}

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $equipmentName = trim((string) ($row[0] ?? ''));
            if (empty($equipmentName)) {
                continue;
            }

            DangerousEquipment::create([
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'last_user_id' => $this->userId,
                'equipment_name' => $equipmentName,
                'utilized_location' => $this->str($row[1] ?? null),
                'norm_model' => $this->str($row[2] ?? null),
                'serial_number' => $this->str($row[3] ?? null),
                'use_time' => $this->date($row[4] ?? null),
                'automation_type' => $this->str($row[5] ?? null),
                'maintain_info' => $this->str($row[6] ?? null),
                'comment' => $this->str($row[7] ?? null),
            ]);
        }
    }

    private function str(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return trim((string) $value);
    }

    private function date(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }
}
