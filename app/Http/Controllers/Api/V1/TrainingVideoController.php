<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreTrainingVideoRequest;
use App\Http\Requests\Api\V1\UpdateTrainingVideoRequest;
use App\Models\TrainingVideo;
use App\Models\TrainingVideoLog;
use App\Services\OssService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingVideoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingVideo::query();

        if ($request->filled('company_id')) {
            $ids = [$request->company_id];
            if ($request->filled('parent_company_id') && (int) $request->parent_company_id > 0) {
                $ids[] = (int) $request->parent_company_id;
            }
            $query->whereIn('company_id', $ids);
        }

        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->title.'%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = TrainingVideo::find($id);

        if (! $data) {
            return $this->notFound('培训视频不存在');
        }

        $data->increment('times_watched');

        TrainingVideoLog::create([
            'training_video_id' => $id,
            'company_id' => auth()->user()->company_id ?? 0,
            'user_id' => auth()->id() ?? 0,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success(OssService::signUrl($data->video_url ?? ''));
    }

    public function store(StoreTrainingVideoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingVideo::create($data);

        return $this->success($record);
    }

    public function update(UpdateTrainingVideoRequest $request, int $id): JsonResponse
    {
        $record = TrainingVideo::find($id);

        if (! $record) {
            return $this->notFound('培训视频不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TrainingVideo::find($id);

        if (! $record) {
            return $this->notFound('培训视频不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
