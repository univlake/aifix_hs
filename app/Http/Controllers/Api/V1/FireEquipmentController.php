<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\FireEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreFireEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateFireEquipmentRequest;

class FireEquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FireEquipment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%' . $request->equipment_name . '%');
        }

        if ($request->filled('special_type')) {
            $query->where('special_type', 'like', '%' . $request->special_type . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = FireEquipment::find($id);

        if (!$data) {
            return $this->notFound('消防器材不存在');
        }

        return $this->success($data);
    }

    public function store(StoreFireEquipmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FireEquipment::create($data);

        return $this->success($record);
    }

    public function update(UpdateFireEquipmentRequest $request, int $id): JsonResponse
    {
        $record = FireEquipment::find($id);

        if (!$record) {
            return $this->notFound('消防器材不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FireEquipment::find($id);

        if (!$record) {
            return $this->notFound('消防器材不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
