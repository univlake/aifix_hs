<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingClassInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreTrainingClassInfoRequest;
use App\Http\Requests\Api\V1\UpdateTrainingClassInfoRequest;

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

    public function store(StoreTrainingClassInfoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingClassInfo::create($data);

        return $this->success($record);
    }

    public function update(UpdateTrainingClassInfoRequest $request, int $id): JsonResponse
    {
        $record = TrainingClassInfo::find($id);

        if (!$record) {
            return $this->notFound('培训课程详情不存在');
        }
        $data = $request->validated();
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
