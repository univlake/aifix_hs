<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingClassInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingClassInfoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingClassInfo::query();

        if ($request->filled('training_class_id')) {
            $query->where('training_class_id', $request->training_class_id);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = TrainingClassInfo::find($id);

        if (!$data) {
            return $this->notFound('培训课程详情不存在');
        }

        $data->increment('times_watched');

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'training_class_id' => 'required|integer',
            'company_id' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'introduce' => 'nullable|string',
            'thumb_url' => 'nullable|string',
            'video_url' => 'nullable|string',
            'duration' => 'nullable|string|max:255',
            'lector' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingClassInfo::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = TrainingClassInfo::find($id);

        if (!$record) {
            return $this->notFound('培训课程详情不存在');
        }

        $data = $request->validate([
            'training_class_id' => 'sometimes|required|integer',
            'company_id' => 'sometimes|required|integer',
            'title' => 'sometimes|nullable|string|max:255',
            'introduce' => 'sometimes|nullable|string',
            'thumb_url' => 'sometimes|nullable|string',
            'video_url' => 'sometimes|nullable|string',
            'duration' => 'sometimes|nullable|string|max:255',
            'lector' => 'sometimes|nullable|string|max:255',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TrainingClassInfo::find($id);

        if (!$record) {
            return $this->notFound('培训课程详情不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
