<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MajorHazardMapController extends Controller
{
    /**
     * 重大危险源地图 — 返回有重大危险源的企业列表
     */
    public function index(Request $request): JsonResponse
    {
        // TODO: 实现公司树过滤 + 重大危险源关联查询
        $list = Company::query()
            ->when($request->title, function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->title . '%');
            })
            ->where('status', 1)
            ->with('majorHazards')
            ->has('majorHazards')
            ->paginate($request->get('per_page', 100));

        return $this->success($list);
    }
}
