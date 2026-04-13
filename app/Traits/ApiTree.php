<?php

namespace App\Traits;

use App\Models\Company;

trait ApiTree
{
    public function ascTree(mixed $data): array
    {
        static $arr = [];
        $arr[] = $data->id;
        foreach ($data->companies as $value) {
            if (!empty($value['companies'])) {
                $this->ascTree($value);
            } else {
                $arr[] = $value['id'];
            }
        }
        return $arr;
    }

    public function descTree(int $companyId): array
    {
        static $arr = [];
        $pid = Company::query()->where('id', $companyId)->value('pid');
        $arr[] = $pid;
        if ($pid != 0) {
            $this->descTree($pid);
        }
        return $arr;
    }
}