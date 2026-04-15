<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreTechnicalServiceUnitRequest;
use App\Http\Requests\Api\V1\UpdateTechnicalServiceUnitRequest;
use App\Models\TechnicalServiceUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechnicalServiceUnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TechnicalServiceUnit::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $record = TechnicalServiceUnit::find($id);

        if (! $record) {
            return $this->notFound('技术服务单位不存在');
        }

        return $this->success($record);
    }

    public function store(StoreTechnicalServiceUnitRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = TechnicalServiceUnit::create($data);

        return $this->success($record);
    }

    public function update(UpdateTechnicalServiceUnitRequest $request, int $id): JsonResponse
    {
        $record = TechnicalServiceUnit::find($id);

        if (! $record) {
            return $this->notFound('技术服务单位不存在');
        }

        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = TechnicalServiceUnit::find($id);

        if (! $record) {
            return $this->notFound('技术服务单位不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
