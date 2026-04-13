<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\BaseArea;
use App\Models\EnterpriseType;
use App\Models\OperationalType;
use App\Models\RecordType;
use Illuminate\Http\JsonResponse;

class BaseDataController extends Controller
{
    /**
     * 企业类型列表
     */
    public function enterpriseTypes(): JsonResponse
    {
        $list = EnterpriseType::query()
            ->select(['id', 'title'])
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($list);
    }

    /**
     * 经营类型列表
     */
    public function operationalTypes(): JsonResponse
    {
        $list = OperationalType::query()
            ->select(['id', 'title'])
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($list);
    }

    /**
     * 地区列表
     */
    public function baseAreas(): JsonResponse
    {
        $list = BaseArea::query()
            ->select(['area_id', 'area_name', 'area_parent_id', 'allname'])
            ->orderBy('area_sort', 'asc')
            ->get();

        return $this->success($list);
    }

    /**
     * 备案/许可类型列表
     */
    public function recordTypes(): JsonResponse
    {
        $list = RecordType::query()
            ->select(['id', 'title'])
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($list);
    }
}
