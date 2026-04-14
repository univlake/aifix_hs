<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingClass::query();

        if ($request->filled('training_class_type_id')) {
            $query->where('training_class_type_id', $request->training_class_type_id);
        }

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = TrainingClass::find($id);

        if (!$data) {
            return $this->notFound('培训课程不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'introduce' => 'nullable|string',
            'thumb_url' => 'nullable|string',
            'grade' => 'nullable|string|max:255',
            'class_hours' => 'nullable|integer',
            'training_class_type_id' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingClass::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = TrainingClass::find($id);

        if (!$record) {
            return $this->notFound('培训课程不存在');
        }

        $data = $request->validate([
            'title' => 'sometimes|nullable|string|max:255',
            'introduce' => 'sometimes|nullable|string',
            'thumb_url' => 'sometimes|nullable|string',
            'grade' => 'sometimes|nullable|string|max:255',
            'class_hours' => 'sometimes|nullable|integer',
            'training_class_type_id' => 'sometimes|nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TrainingClass::find($id);

        if (!$record) {
            return $this->notFound('培训课程不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
