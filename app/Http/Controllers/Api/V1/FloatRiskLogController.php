<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\FloatRiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreFloatRiskLogRequest;
use App\Http\Requests\Api\V1\UpdateFloatRiskLogRequest;

class FloatRiskLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FloatRiskLog::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = FloatRiskLog::find($id);

        if (!$data) {
            return $this->notFound('动态风险日志不存在');
        }

        return $this->success($data);
    }

    public function store(StoreFloatRiskLogRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $floatRiskLog = FloatRiskLog::create($data);

        return $this->success($floatRiskLog);
    }

    public function update(UpdateFloatRiskLogRequest $request, int $id): JsonResponse
    {
        $floatRiskLog = FloatRiskLog::find($id);

        if (!$floatRiskLog) {
            return $this->notFound('动态风险日志不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $floatRiskLog->update($data);

        return $this->success($floatRiskLog->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $floatRiskLog = FloatRiskLog::find($id);

        if (!$floatRiskLog) {
            return $this->notFound('动态风险日志不存在');
        }

        $floatRiskLog->delete();

        return $this->message('删除成功');
    }
}
