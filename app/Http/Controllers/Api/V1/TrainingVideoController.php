<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingVideo;
use App\Models\TrainingVideoLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingVideoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingVideo::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = TrainingVideo::find($id);

        if (!$data) {
            return $this->notFound('培训视频不存在');
        }

        $data->increment('times_watched');

        TrainingVideoLog::create([
            'training_video_id' => $id,
            'company_id' => auth()->user()->company_id ?? 0,
            'user_id' => auth()->id() ?? 0,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
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

        $record = TrainingVideo::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = TrainingVideo::find($id);

        if (!$record) {
            return $this->notFound('培训视频不存在');
        }

        $data = $request->validate([
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
        $record = TrainingVideo::find($id);

        if (!$record) {
            return $this->notFound('培训视频不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
