<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreDailyCheckTemplatesRequest;
use App\Http\Requests\Api\V1\UpdateDailyCheckTemplatesRequest;
use App\Models\DailyCheckTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyCheckTemplatesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DailyCheckTemplate::query()->where('level', 1);

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $data = $query->orderBy('sort')
            ->with(['child' => function ($q) use ($request) {
                if ($request->filled('year')) {
                    $q->where('year', $request->year);
                }
                $q->orderBy('sort');
            }])
            ->get();

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = DailyCheckTemplate::with(['child'])->find($id);

        if (! $data) {
            return $this->notFound('日常检查模板不存在');
        }

        return $this->success($data);
    }

    public function store(StoreDailyCheckTemplatesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = DailyCheckTemplate::create($data);

        return $this->success($record);
    }

    public function update(UpdateDailyCheckTemplatesRequest $request, int $id): JsonResponse
    {
        $record = DailyCheckTemplate::find($id);

        if (! $record) {
            return $this->notFound('日常检查模板不存在');
        }
        $data = $request->validated();
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = DailyCheckTemplate::find($id);

        if (! $record) {
            return $this->notFound('日常检查模板不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
