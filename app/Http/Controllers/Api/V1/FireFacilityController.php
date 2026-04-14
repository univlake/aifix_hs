<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\FireFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FireFacilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FireFacility::query();

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
        $data = FireFacility::find($id);

        if (!$data) {
            return $this->notFound('消防设施不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'equipment_name' => 'nullable|string|max:255',
            'utilized_location' => 'nullable|string|max:255',
            'special_type' => 'nullable|string|max:255',
            'use_time' => 'nullable|date',
            'automation_type' => 'nullable|string|max:255',
            'maintain_info' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FireFacility::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = FireFacility::find($id);

        if (!$record) {
            return $this->notFound('消防设施不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'equipment_name' => 'sometimes|nullable|string|max:255',
            'utilized_location' => 'sometimes|nullable|string|max:255',
            'special_type' => 'sometimes|nullable|string|max:255',
            'use_time' => 'sometimes|nullable|date',
            'automation_type' => 'sometimes|nullable|string|max:255',
            'maintain_info' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FireFacility::find($id);

        if (!$record) {
            return $this->notFound('消防设施不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
