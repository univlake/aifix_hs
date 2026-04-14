<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreRiskLogRequest;
use App\Http\Requests\Api\V1\UpdateRiskLogRequest;

class RiskLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RiskLog::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = RiskLog::find($id);

        if (!$data) {
            return $this->notFound('风险日志不存在');
        }

        return $this->success($data);
    }

    public function store(StoreRiskLogRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskLog = RiskLog::create($data);

        return $this->success($riskLog);
    }

    public function update(UpdateRiskLogRequest $request, int $id): JsonResponse
    {
        $riskLog = RiskLog::find($id);

        if (!$riskLog) {
            return $this->notFound('风险日志不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $riskLog->update($data);

        return $this->success($riskLog->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $riskLog = RiskLog::find($id);

        if (!$riskLog) {
            return $this->notFound('风险日志不存在');
        }

        $riskLog->delete();

        return $this->message('删除成功');
    }
}
