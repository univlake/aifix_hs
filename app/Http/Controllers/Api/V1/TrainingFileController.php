<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreTrainingFileRequest;
use App\Http\Requests\Api\V1\UpdateTrainingFileRequest;
use App\Models\TrainingFile;
use App\Models\TrainingFileLog;
use App\Services\OssService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingFile::query();

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
        $data = TrainingFile::find($id);

        if (! $data) {
            return $this->notFound('培训材料不存在');
        }

        $data->increment('times_download');

        TrainingFileLog::create([
            'training_file_id' => $id,
            'company_id' => auth()->user()->company_id ?? 0,
            'user_id' => auth()->id() ?? 0,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success(OssService::signUrl($data->file_url ?? ''));
    }

    public function store(StoreTrainingFileRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingFile::create($data);

        return $this->success($record);
    }

    public function update(UpdateTrainingFileRequest $request, int $id): JsonResponse
    {
        $record = TrainingFile::find($id);

        if (! $record) {
            return $this->notFound('培训材料不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TrainingFile::find($id);

        if (! $record) {
            return $this->notFound('培训材料不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
