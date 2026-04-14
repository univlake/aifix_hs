<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SpecialEquipmentStaff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'cert_title' => 'nullable|string|max:255',
            'cert_number' => 'nullable|string|max:255',
            'valid_period' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipmentStaff = SpecialEquipmentStaff::create($data);

        return $this->success($specialEquipmentStaff);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $specialEquipmentStaff = SpecialEquipmentStaff::find($id);

        if (!$specialEquipmentStaff) {
            return $this->notFound('特种设备人员不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'cert_title' => 'sometimes|nullable|string|max:255',
            'cert_number' => 'sometimes|nullable|string|max:255',
            'valid_period' => 'sometimes|nullable|date',
            'company_id' => 'sometimes|required|integer',
        ]);

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
