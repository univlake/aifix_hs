<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ThreeTogether;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThreeTogetherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ThreeTogether::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with(['designUnit', 'evaluationUnit'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = ThreeTogether::with(['designUnit', 'evaluationUnit'])->find($id);

        if (!$data) {
            return $this->notFound('三同时管理不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'three_together_type' => 'nullable|string|max:255',
            'establish_time' => 'nullable|date',
            'establish_section' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'design_unit_id' => 'nullable|integer',
            'design_annex_url' => 'nullable|string',
            'evaluation_unit_id' => 'nullable|integer',
            'write_time' => 'nullable|date',
            'construction_comment' => 'nullable|string',
            'safety_requirements' => 'nullable|string',
            'complete_comment' => 'nullable|string',
            'acceptance' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ThreeTogether::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = ThreeTogether::find($id);

        if (!$record) {
            return $this->notFound('三同时管理不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'three_together_type' => 'sometimes|nullable|string|max:255',
            'establish_time' => 'sometimes|nullable|date',
            'establish_section' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|nullable|string|max:255',
            'design_unit_id' => 'sometimes|nullable|integer',
            'design_annex_url' => 'sometimes|nullable|string',
            'evaluation_unit_id' => 'sometimes|nullable|integer',
            'write_time' => 'sometimes|nullable|date',
            'construction_comment' => 'sometimes|nullable|string',
            'safety_requirements' => 'sometimes|nullable|string',
            'complete_comment' => 'sometimes|nullable|string',
            'acceptance' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = ThreeTogether::find($id);

        if (!$record) {
            return $this->notFound('三同时管理不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
