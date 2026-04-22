<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreAccidentCheckTemplatesRequest;
use App\Http\Requests\Api\V1\UpdateAccidentCheckTemplatesRequest;
use App\Models\AccidentCheckTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccidentCheckTemplatesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AccidentCheckTemplate::query()->where('level', 1);

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
        $data = AccidentCheckTemplate::with(['child'])->find($id);

        if (! $data) {
            return $this->notFound('事故检查模板不存在');
        }

        return $this->success($data);
    }

    public function store(StoreAccidentCheckTemplatesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = AccidentCheckTemplate::create($data);

        return $this->success($record);
    }

    public function update(UpdateAccidentCheckTemplatesRequest $request, int $id): JsonResponse
    {
        $record = AccidentCheckTemplate::find($id);

        if (! $record) {
            return $this->notFound('事故检查模板不存在');
        }
        $data = $request->validated();
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = AccidentCheckTemplate::find($id);

        if (! $record) {
            return $this->notFound('事故检查模板不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
