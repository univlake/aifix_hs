<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\FloatRiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'internal_meeting_scale' => 'nullable|numeric',
            'internal_training_scale' => 'nullable|numeric',
            'accident_bulletin_scale' => 'nullable|numeric',
            'accident_bulletin_severe_scale' => 'nullable|numeric',
            'accident_report_url_scale' => 'nullable|numeric',
            'emergency_team_scale' => 'nullable|numeric',
            'emergency_drill_scale' => 'nullable|numeric',
            'job_management_scale' => 'nullable|numeric',
            'risk_source_scale' => 'nullable|numeric',
            'monthly_investigation_scale' => 'nullable|numeric',
            'three_together_over_scale' => 'nullable|numeric',
            'unit_sum_number_scale' => 'nullable|numeric',
            'evaluation_unit_scale' => 'nullable|numeric',
            'evaluation_unit_school_scale' => 'nullable|numeric',
            'health_checkup_people_scale' => 'nullable|numeric',
            'health_checkup_scale' => 'nullable|numeric',
            'health_report_scale' => 'nullable|numeric',
            'company_id' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $floatRiskLog = FloatRiskLog::create($data);

        return $this->success($floatRiskLog);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $floatRiskLog = FloatRiskLog::find($id);

        if (!$floatRiskLog) {
            return $this->notFound('动态风险日志不存在');
        }

        $data = $request->validate([
            'internal_meeting_scale' => 'sometimes|nullable|numeric',
            'internal_training_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_severe_scale' => 'sometimes|nullable|numeric',
            'accident_report_url_scale' => 'sometimes|nullable|numeric',
            'emergency_team_scale' => 'sometimes|nullable|numeric',
            'emergency_drill_scale' => 'sometimes|nullable|numeric',
            'job_management_scale' => 'sometimes|nullable|numeric',
            'risk_source_scale' => 'sometimes|nullable|numeric',
            'monthly_investigation_scale' => 'sometimes|nullable|numeric',
            'three_together_over_scale' => 'sometimes|nullable|numeric',
            'unit_sum_number_scale' => 'sometimes|nullable|numeric',
            'evaluation_unit_scale' => 'sometimes|nullable|numeric',
            'evaluation_unit_school_scale' => 'sometimes|nullable|numeric',
            'health_checkup_people_scale' => 'sometimes|nullable|numeric',
            'health_checkup_scale' => 'sometimes|nullable|numeric',
            'health_report_scale' => 'sometimes|nullable|numeric',
            'company_id' => 'sometimes|nullable|integer',
        ]);

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
