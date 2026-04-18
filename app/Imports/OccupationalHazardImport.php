<?php

namespace App\Imports;

use App\Models\OccupationalHazard;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class OccupationalHazardImport implements SkipsEmptyRows, ToCollection, WithStartRow
{
    private array $errors = [];

    private static array $validTypes = ['粉尘类', '放射性物质类', '化学物质类', '噪音', '其他'];

    private static array $validDeclare = ['已申报', '未申报'];

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
        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            $rowErrors = [];

            $name = trim((string) ($row[0] ?? ''));
            if ($name === '') {
                $rowErrors[] = '作业场所不能为空';
            }

            $type = $this->str($row[1] ?? null);
            if ($type !== null && ! in_array($type, self::$validTypes, true)) {
                $rowErrors[] = '职业危害因素无效，可选：'.implode('、', self::$validTypes);
            }

            $isRaw = $this->str($row[3] ?? null);
            $isDeclare = $isRaw;
            if ($isDeclare !== null && ! in_array($isDeclare, self::$validDeclare, true)) {
                $rowErrors[] = '申报状态无效，可选：已申报、未申报';
            }

            if ($rowErrors) {
                $this->errors[] = ['row' => $rowNum, 'errors' => $rowErrors];

                continue;
            }

            OccupationalHazard::create([
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'last_user_id' => $this->userId,
                'name' => $name,
                'type' => $type,
                'number' => isset($row[2]) && $row[2] !== '' ? (int) $row[2] : null,
                'is_declare' => $isDeclare,
                'declare_date' => $this->date($row[4] ?? null),
            ]);
        }
    }

    public function getErrors(): array
    {
        return $this->errors;
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
