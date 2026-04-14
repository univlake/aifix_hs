<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DangerousEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreDangerousEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateDangerousEquipmentRequest;

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

    public function store(StoreDangerousEquipmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $dangerousEquipment = DangerousEquipment::create($data);

        return $this->success($dangerousEquipment);
    }

    public function update(UpdateDangerousEquipmentRequest $request, int $id): JsonResponse
    {
        $dangerousEquipment = DangerousEquipment::find($id);

        if (!$dangerousEquipment) {
            return $this->notFound('危险化工设备不存在');
        }
        $data = $request->validated();
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
