<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ReportConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreReportConfigRequest;
use App\Http\Requests\Api\V1\UpdateReportConfigRequest;

class ReportConfigController extends Controller
{
    /**
     * 报表配置列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReportConfig::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建报表配置
     */
    public function store(StoreReportConfigRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = ReportConfig::create($data);

        return $this->success($type);
    }

    /**
     * 更新报表配置
     */
    public function update(UpdateReportConfigRequest $request, int $id): JsonResponse
    {
        $type = ReportConfig::find($id);

        if (!$type) {
            return $this->notFound('报表配置不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除报表配置
     */
    public function destroy(int $id): JsonResponse
    {
        $type = ReportConfig::find($id);

        if (!$type) {
            return $this->notFound('报表配置不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
