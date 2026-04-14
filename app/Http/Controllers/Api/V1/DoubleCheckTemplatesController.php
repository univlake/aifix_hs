<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DoubleCheckTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoubleCheckTemplatesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DoubleCheckTemplate::query()->where('level', 1);

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
        $data = DoubleCheckTemplate::with(['child'])->find($id);

        if (!$data) {
            return $this->notFound('双重预防模板不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string',
            'level' => 'nullable|integer',
            'sort' => 'nullable|integer',
            'pid' => 'nullable|integer',
            'year' => 'required|integer',
            'score_range' => 'nullable|string',
        ]);

        $record = DoubleCheckTemplate::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = DoubleCheckTemplate::find($id);

        if (!$record) {
            return $this->notFound('双重预防模板不存在');
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string',
            'level' => 'sometimes|nullable|integer',
            'sort' => 'sometimes|nullable|integer',
            'pid' => 'sometimes|nullable|integer',
            'year' => 'sometimes|required|integer',
            'score_range' => 'sometimes|nullable|string',
        ]);

        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = DoubleCheckTemplate::find($id);

        if (!$record) {
            return $this->notFound('双重预防模板不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
