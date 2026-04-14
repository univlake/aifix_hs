<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'nullable|integer',
            'old_risk_num' => 'nullable|numeric',
            'risk_num' => 'nullable|numeric',
            'date' => 'nullable|integer',
            'content' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'old_risk_grade' => 'nullable|string|max:255',
            'risk_grade' => 'nullable|string|max:255',
            'company_id' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskLog = RiskLog::create($data);

        return $this->success($riskLog);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $riskLog = RiskLog::find($id);

        if (!$riskLog) {
            return $this->notFound('风险日志不存在');
        }

        $data = $request->validate([
            'type' => 'sometimes|nullable|integer',
            'old_risk_num' => 'sometimes|nullable|numeric',
            'risk_num' => 'sometimes|nullable|numeric',
            'date' => 'sometimes|nullable|integer',
            'content' => 'sometimes|nullable|string|max:255',
            'company_name' => 'sometimes|nullable|string|max:255',
            'old_risk_grade' => 'sometimes|nullable|string|max:255',
            'risk_grade' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|nullable|integer',
        ]);

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
