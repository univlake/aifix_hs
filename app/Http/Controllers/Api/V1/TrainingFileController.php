<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingFile;
use App\Models\TrainingFileLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingFile::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = TrainingFile::find($id);

        if (!$data) {
            return $this->notFound('培训材料不存在');
        }

        $data->increment('times_download');

        TrainingFileLog::create([
            'training_file_id' => $id,
            'company_id' => auth()->user()->company_id ?? 0,
            'user_id' => auth()->id() ?? 0,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($data->file_url);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'file_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TrainingFile::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = TrainingFile::find($id);

        if (!$record) {
            return $this->notFound('培训材料不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'title' => 'sometimes|nullable|string|max:255',
            'file_url' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TrainingFile::find($id);

        if (!$record) {
            return $this->notFound('培训材料不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
