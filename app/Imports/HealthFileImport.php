<?php

namespace App\Imports;

use App\Models\HealthFile;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class HealthFileImport implements SkipsEmptyRows, ToCollection, WithStartRow
{
    private array $errors = [];

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
                $rowErrors[] = '姓名不能为空';
            }

            if ($rowErrors) {
                $this->errors[] = ['row' => $rowNum, 'errors' => $rowErrors];

                continue;
            }

            HealthFile::create([
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'last_user_id' => $this->userId,
                'name' => $name,
                'number' => $this->str($row[1] ?? null),
                'department' => $this->str($row[2] ?? null),
                'post' => $this->str($row[3] ?? null),
                'checkup_date' => $this->date($row[4] ?? null),
                'checkup_expiry' => $this->str($row[5] ?? null),
                'review_situation' => $this->str($row[6] ?? null),
                'handling_opinions' => $this->str($row[7] ?? null),
                'process_result' => $this->str($row[8] ?? null),
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
