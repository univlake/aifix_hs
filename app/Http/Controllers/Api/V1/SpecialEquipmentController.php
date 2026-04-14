<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SpecialEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpecialEquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SpecialEquipment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%' . $request->equipment_name . '%');
        }

        if ($request->filled('special_type_id')) {
            $query->where('special_type_id', $request->special_type_id);
        }

        $list = $query->with('specialType')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SpecialEquipment::with('specialType')->find($id);

        if (!$data) {
            return $this->notFound('特种设备不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'equipment_name' => 'nullable|string|max:255',
            'special_type_id' => 'nullable|integer',
            'utilized_location' => 'nullable|string|max:255',
            'norm_model1' => 'nullable|string|max:255',
            'norm_model2' => 'nullable|string|max:255',
            'norm_model3' => 'nullable|string|max:255',
            'norm_model4' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'use_time' => 'nullable|date',
            'valid_period' => 'nullable|date',
            'inspect_unit' => 'nullable|string|max:255',
            'maintain_info' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipment = SpecialEquipment::create($data);

        return $this->success($specialEquipment);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $specialEquipment = SpecialEquipment::find($id);

        if (!$specialEquipment) {
            return $this->notFound('特种设备不存在');
        }

        $data = $request->validate([
            'equipment_name' => 'sometimes|nullable|string|max:255',
            'special_type_id' => 'sometimes|nullable|integer',
            'utilized_location' => 'sometimes|nullable|string|max:255',
            'norm_model1' => 'sometimes|nullable|string|max:255',
            'norm_model2' => 'sometimes|nullable|string|max:255',
            'norm_model3' => 'sometimes|nullable|string|max:255',
            'norm_model4' => 'sometimes|nullable|string|max:255',
            'serial_number' => 'sometimes|nullable|string|max:255',
            'use_time' => 'sometimes|nullable|date',
            'valid_period' => 'sometimes|nullable|date',
            'inspect_unit' => 'sometimes|nullable|string|max:255',
            'maintain_info' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $specialEquipment->update($data);

        return $this->success($specialEquipment->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $specialEquipment = SpecialEquipment::find($id);

        if (!$specialEquipment) {
            return $this->notFound('特种设备不存在');
        }

        $specialEquipment->delete();

        return $this->message('删除成功');
    }
}
