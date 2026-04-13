<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use App\Traits\ApiResponse;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use ApiResponse;

    public function childId(int $id): array
    {
        $ids = [];
        $result = [];
        $companyId = Company::query()
            ->where('pid', $id)
            ->where('status', 1)
            ->where('is_produce', 1)
            ->pluck('id');

        if ($companyId->isNotEmpty()) {
            foreach ($companyId as $v) {
                $ids[] = $v;
                $ids[] = $this->childId($v);
            }
        }

        array_walk_recursive($ids, function ($value) use (&$result) {
            array_push($result, $value);
        });

        return array_filter($result);
    }

    public function getCompanyId(int $id): array
    {
        $ids = [];
        $result = [];
        $companyId = Company::query()
            ->where('pid', $id)
            ->where('status', 1)
            ->pluck('id');

        if ($companyId->isNotEmpty()) {
            foreach ($companyId as $v) {
                $ids[] = $v;
                $ids[] = $this->getCompanyId($v);
            }
        }

        array_walk_recursive($ids, function ($value) use (&$result) {
            array_push($result, $value);
        });

        return array_filter($result);
    }
}