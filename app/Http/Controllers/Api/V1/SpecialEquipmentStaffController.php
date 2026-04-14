<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SpecialEquipmentStaff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreSpecialEquipmentStaffRequest;
use App\Http\Requests\Api\V1\UpdateSpecialEquipmentStaffRequest;

class SpecialEquipmentStaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SpecialEquipmentStaff::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SpecialEquipmentStaff::find($id);

        if (!$data) {
            return $this->notFound('特种设备人员不存在');
        }

        return $this->success($data);
    }

    public function store(StoreSpecialEquipmentStaffRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipmentStaff = SpecialEquipmentStaff::create($data);

        return $this->success($specialEquipmentStaff);
    }

    public function update(UpdateSpecialEquipmentStaffRequest $request, int $id): JsonResponse
    {
        $specialEquipmentStaff = SpecialEquipmentStaff::find($id);

        if (!$specialEquipmentStaff) {
            return $this->notFound('特种设备人员不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $specialEquipmentStaff->update($data);

        return $this->success($specialEquipmentStaff->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $specialEquipmentStaff = SpecialEquipmentStaff::find($id);

        if (!$specialEquipmentStaff) {
            return $this->notFound('特种设备人员不存在');
        }

        $specialEquipmentStaff->delete();

        return $this->message('删除成功');
    }
}
