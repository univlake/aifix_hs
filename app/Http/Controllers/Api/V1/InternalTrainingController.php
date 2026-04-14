<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\InternalTraining;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalTrainingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InternalTraining::query();

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
        $data = InternalTraining::find($id);

        if (!$data) {
            return $this->notFound('内部培训不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'object' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'training_date' => 'nullable|date',
            'training_type' => 'nullable|string|max:255',
            'happening' => 'nullable|string',
            'annex_url' => 'nullable|string',
            'summary_annex_url' => 'nullable|string',
            'sign_annex_url' => 'nullable|string',
            'material_annex_url' => 'nullable|string',
            'photo_annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = InternalTraining::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = InternalTraining::find($id);

        if (!$record) {
            return $this->notFound('内部培训不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
            'object' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'training_date' => 'sometimes|nullable|date',
            'training_type' => 'sometimes|nullable|string|max:255',
            'happening' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'summary_annex_url' => 'sometimes|nullable|string',
            'sign_annex_url' => 'sometimes|nullable|string',
            'material_annex_url' => 'sometimes|nullable|string',
            'photo_annex_url' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = InternalTraining::find($id);

        if (!$record) {
            return $this->notFound('内部培训不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
