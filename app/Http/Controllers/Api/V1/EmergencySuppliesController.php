<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\EmergencySupplies;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmergencySuppliesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmergencySupplies::query();

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
        $data = EmergencySupplies::find($id);

        if (!$data) {
            return $this->notFound('应急物资不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:255',
            'save_user' => 'nullable|string|max:255',
            'tel' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = EmergencySupplies::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = EmergencySupplies::find($id);

        if (!$record) {
            return $this->notFound('应急物资不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|string|max:255',
            'save_user' => 'sometimes|nullable|string|max:255',
            'tel' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = EmergencySupplies::find($id);

        if (!$record) {
            return $this->notFound('应急物资不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
