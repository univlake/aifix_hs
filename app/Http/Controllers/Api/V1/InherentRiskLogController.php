<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\InherentRiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InherentRiskLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InherentRiskLog::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = InherentRiskLog::find($id);

        if (!$data) {
            return $this->notFound('固有风险日志不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'safety_architecture_value' => 'nullable|numeric',
            'security_officer_scale' => 'nullable|numeric',
            'already_obtain_people_scale' => 'nullable|numeric',
            'last_year_income_scale' => 'nullable|numeric',
            'funding_execution_scale' => 'nullable|numeric',
            'production_standardization_scale' => 'nullable|numeric',
            'health_system_scale' => 'nullable|numeric',
            'assess_detect_scale' => 'nullable|numeric',
            'high_school_diploma_scale' => 'nullable|numeric',
            'acreage_scale' => 'nullable|numeric',
            'staff_scale' => 'nullable|numeric',
            'safety_engineering_major_scale' => 'nullable|numeric',
            'hazardous_processes_scale' => 'nullable|numeric',
            'hazardous_process_scale' => 'nullable|numeric',
            'hazardous_process_more_scale' => 'nullable|numeric',
            'process_is_automatic_scale' => 'nullable|numeric',
            'special_equipment_number_scale' => 'nullable|numeric',
            'equipment_more_number_scale' => 'nullable|numeric',
            'hazardous_chemical_scale' => 'nullable|numeric',
            'hazardous_chemicals_number_scale' => 'nullable|numeric',
            'major_hazard_scale' => 'nullable|numeric',
            'company_id' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $inherentRiskLog = InherentRiskLog::create($data);

        return $this->success($inherentRiskLog);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $inherentRiskLog = InherentRiskLog::find($id);

        if (!$inherentRiskLog) {
            return $this->notFound('固有风险日志不存在');
        }

        $data = $request->validate([
            'safety_architecture_value' => 'sometimes|nullable|numeric',
            'security_officer_scale' => 'sometimes|nullable|numeric',
            'already_obtain_people_scale' => 'sometimes|nullable|numeric',
            'last_year_income_scale' => 'sometimes|nullable|numeric',
            'funding_execution_scale' => 'sometimes|nullable|numeric',
            'production_standardization_scale' => 'sometimes|nullable|numeric',
            'health_system_scale' => 'sometimes|nullable|numeric',
            'assess_detect_scale' => 'sometimes|nullable|numeric',
            'high_school_diploma_scale' => 'sometimes|nullable|numeric',
            'acreage_scale' => 'sometimes|nullable|numeric',
            'staff_scale' => 'sometimes|nullable|numeric',
            'safety_engineering_major_scale' => 'sometimes|nullable|numeric',
            'hazardous_processes_scale' => 'sometimes|nullable|numeric',
            'hazardous_process_scale' => 'sometimes|nullable|numeric',
            'hazardous_process_more_scale' => 'sometimes|nullable|numeric',
            'process_is_automatic_scale' => 'sometimes|nullable|numeric',
            'special_equipment_number_scale' => 'sometimes|nullable|numeric',
            'equipment_more_number_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemical_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemicals_number_scale' => 'sometimes|nullable|numeric',
            'major_hazard_scale' => 'sometimes|nullable|numeric',
            'company_id' => 'sometimes|nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $inherentRiskLog->update($data);

        return $this->success($inherentRiskLog->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $inherentRiskLog = InherentRiskLog::find($id);

        if (!$inherentRiskLog) {
            return $this->notFound('固有风险日志不存在');
        }

        $inherentRiskLog->delete();

        return $this->message('删除成功');
    }
}
