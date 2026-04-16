<?php

namespace App\Traits;

use App\Models\Company;

trait ApiTree
{
    public function ascTree(mixed $data): array
    {
        $arr = [];
        $this->collectDescendantIds($data, $arr);

        return $arr;
    }

    private function collectDescendantIds(mixed $data, array &$arr): void
    {
        $arr[] = $data->id;
        foreach ($data->companies as $value) {
            if (! empty($value['companies'])) {
                $this->collectDescendantIds($value, $arr);
            } else {
                $arr[] = $value['id'];
            }
        }
    }

    public function descTree(int $companyId): array
    {
        $arr = [];
        $this->collectAncestorIds($companyId, $arr);

        return $arr;
    }

    private function collectAncestorIds(int $companyId, array &$arr): void
    {
        $pid = Company::query()->where('id', $companyId)->value('pid');
        $arr[] = $pid;
        if ($pid != 0) {
            $this->collectAncestorIds($pid, $arr);
        }
    }
}
