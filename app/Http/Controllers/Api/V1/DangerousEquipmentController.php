<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DangerousEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DangerousEquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DangerousEquipment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%' . $request->equipment_name . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = DangerousEquipment::find($id);

        if (!$data) {
            return $this->notFound('危险化工设备不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'equipment_name' => 'nullable|string|max:255',
            'utilized_location' => 'nullable|string|max:255',
            'norm_model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'use_time' => 'nullable|date',
            'automation_type' => 'nullable|string|max:255',
            'maintain_info' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $dangerousEquipment = DangerousEquipment::create($data);

        return $this->success($dangerousEquipment);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $dangerousEquipment = DangerousEquipment::find($id);

        if (!$dangerousEquipment) {
            return $this->notFound('危险化工设备不存在');
        }

        $data = $request->validate([
            'equipment_name' => 'sometimes|nullable|string|max:255',
            'utilized_location' => 'sometimes|nullable|string|max:255',
            'norm_model' => 'sometimes|nullable|string|max:255',
            'serial_number' => 'sometimes|nullable|string|max:255',
            'use_time' => 'sometimes|nullable|date',
            'automation_type' => 'sometimes|nullable|string|max:255',
            'maintain_info' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $dangerousEquipment->update($data);

        return $this->success($dangerousEquipment->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $dangerousEquipment = DangerousEquipment::find($id);

        if (!$dangerousEquipment) {
            return $this->notFound('危险化工设备不存在');
        }

        $dangerousEquipment->delete();

        return $this->message('删除成功');
    }
}
