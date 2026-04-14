<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskMaxValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiskMaxValueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RiskMaxValue::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = RiskMaxValue::find($id);

        if (!$data) {
            return $this->notFound('风险最大值不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'security_officer_scale' => 'nullable|numeric',
            'already_obtain_people_scale' => 'nullable|numeric',
            'last_year_income_scale' => 'nullable|numeric',
            'acreage_scale' => 'nullable|numeric',
            'hazardous_processes_scale' => 'nullable|numeric',
            'hazardous_chemicals_scale' => 'nullable|numeric',
            'internal_meeting_scale' => 'nullable|numeric',
            'internal_training_scale' => 'nullable|numeric',
            'accident_bulletin_scale' => 'nullable|numeric',
            'emergency_team_scale' => 'nullable|numeric',
            'emergency_drill_scale' => 'nullable|numeric',
            'job_management_scale' => 'nullable|numeric',
            'health_checkup_scale' => 'nullable|numeric',
            'company_id' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskMaxValue = RiskMaxValue::create($data);

        return $this->success($riskMaxValue);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $riskMaxValue = RiskMaxValue::find($id);

        if (!$riskMaxValue) {
            return $this->notFound('风险最大值不存在');
        }

        $data = $request->validate([
            'security_officer_scale' => 'sometimes|nullable|numeric',
            'already_obtain_people_scale' => 'sometimes|nullable|numeric',
            'last_year_income_scale' => 'sometimes|nullable|numeric',
            'acreage_scale' => 'sometimes|nullable|numeric',
            'hazardous_processes_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemicals_scale' => 'sometimes|nullable|numeric',
            'internal_meeting_scale' => 'sometimes|nullable|numeric',
            'internal_training_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_scale' => 'sometimes|nullable|numeric',
            'emergency_team_scale' => 'sometimes|nullable|numeric',
            'emergency_drill_scale' => 'sometimes|nullable|numeric',
            'job_management_scale' => 'sometimes|nullable|numeric',
            'health_checkup_scale' => 'sometimes|nullable|numeric',
            'company_id' => 'sometimes|nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $riskMaxValue->update($data);

        return $this->success($riskMaxValue->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $riskMaxValue = RiskMaxValue::find($id);

        if (!$riskMaxValue) {
            return $this->notFound('风险最大值不存在');
        }

        $riskMaxValue->delete();

        return $this->message('删除成功');
    }
}
