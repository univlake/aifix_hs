<?php

namespace App\Imports;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class StaffImport implements SkipsEmptyRows, ToCollection, WithStartRow
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<int, string>  $columnMap  index => field name
     */
    public function __construct(
        private readonly string $modelClass,
        private readonly int $companyId,
        private readonly array $columnMap,
        private readonly int $userId = 0,
    ) {}

    public function startRow(): int
    {
        return 2; // skip header row
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $data = [
                'company_id' => $this->companyId,
                'user_id' => $this->userId,
                'last_user_id' => $this->userId,
            ];

            foreach ($this->columnMap as $index => $field) {
                $value = $row[$index] ?? null;

                if ($value === null || $value === '') {
                    $data[$field] = null;

                    continue;
                }

                if ($field === 'valid_period') {
                    try {
                        $data[$field] = Carbon::parse($value)->format('Y-m-d');
                    } catch (\Exception) {
                        $data[$field] = null;
                    }
                } else {
                    $data[$field] = trim((string) $value);
                }
            }

            // Only insert if name is present
            if (! empty($data['name'])) {
                ($this->modelClass)::create($data);
            }
        }
    }
}
