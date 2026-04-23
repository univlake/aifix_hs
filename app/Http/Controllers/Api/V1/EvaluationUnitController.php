<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreEvaluationUnitRequest;
use App\Http\Requests\Api\V1\UpdateEvaluationUnitRequest;
use App\Models\EvaluationUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationUnitController extends Controller
{
    /**
     * 评价单位列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = EvaluationUnit::query();

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

    /**
     * 评价单位详情
     */
    public function show(int $id): JsonResponse
    {
        $record = EvaluationUnit::find($id);

        if (! $record) {
            return $this->notFound('评价单位不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建评价单位
     */
    public function store(StoreEvaluationUnitRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = EvaluationUnit::create($data);

        return $this->success($record);
    }

    /**
     * 更新评价单位
     */
    public function update(UpdateEvaluationUnitRequest $request, int $id): JsonResponse
    {
        $record = EvaluationUnit::find($id);

        if (! $record) {
            return $this->notFound('评价单位不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除评价单位
     */
    public function destroy(int $id): JsonResponse
    {
        $record = EvaluationUnit::find($id);

        if (! $record) {
            return $this->notFound('评价单位不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
