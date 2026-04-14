<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SpecialEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreSpecialEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateSpecialEquipmentRequest;

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

    public function store(StoreSpecialEquipmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipment = SpecialEquipment::create($data);

        return $this->success($specialEquipment);
    }

    public function update(UpdateSpecialEquipmentRequest $request, int $id): JsonResponse
    {
        $specialEquipment = SpecialEquipment::find($id);

        if (!$specialEquipment) {
            return $this->notFound('特种设备不存在');
        }
        $data = $request->validated();
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
