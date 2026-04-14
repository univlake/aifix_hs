<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\EmergencyDrill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmergencyDrillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmergencyDrill::query();

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
        $data = EmergencyDrill::find($id);

        if (!$data) {
            return $this->notFound('应急演练不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'drill_time' => 'nullable|date',
            'drill_local' => 'nullable|string|max:255',
            'organization_department' => 'nullable|string|max:255',
            'join_department' => 'nullable|string|max:255',
            'drill_number' => 'nullable|string|max:255',
            'drill_type' => 'nullable|string|max:255',
            'drill_form' => 'nullable|string|max:255',
            'drill_plan' => 'nullable|string|max:255',
            'drill_kind' => 'nullable|string|max:255',
            'event' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = EmergencyDrill::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = EmergencyDrill::find($id);

        if (!$record) {
            return $this->notFound('应急演练不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'drill_time' => 'sometimes|nullable|date',
            'drill_local' => 'sometimes|nullable|string|max:255',
            'organization_department' => 'sometimes|nullable|string|max:255',
            'join_department' => 'sometimes|nullable|string|max:255',
            'drill_number' => 'sometimes|nullable|string|max:255',
            'drill_type' => 'sometimes|nullable|string|max:255',
            'drill_form' => 'sometimes|nullable|string|max:255',
            'drill_plan' => 'sometimes|nullable|string|max:255',
            'drill_kind' => 'sometimes|nullable|string|max:255',
            'event' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = EmergencyDrill::find($id);

        if (!$record) {
            return $this->notFound('应急演练不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
