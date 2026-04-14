<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreTrainingClassRequest;
use App\Http\Requests\Api\V1\UpdateTrainingClassRequest;

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

    public function store(StoreTrainingClassRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingClass::create($data);

        return $this->success($record);
    }

    public function update(UpdateTrainingClassRequest $request, int $id): JsonResponse
    {
        $record = TrainingClass::find($id);

        if (!$record) {
            return $this->notFound('培训课程不存在');
        }
        $data = $request->validated();
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
