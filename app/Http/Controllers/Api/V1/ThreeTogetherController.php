<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreThreeTogetherRequest;
use App\Http\Requests\Api\V1\UpdateThreeTogetherRequest;
use App\Models\ThreeTogether;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThreeTogetherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ThreeTogether::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->with(['designUnit', 'evaluationUnit'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = ThreeTogether::with(['designUnit', 'evaluationUnit'])->find($id);

        if (! $data) {
            return $this->notFound('三同时管理不存在');
        }

        return $this->success($data);
    }

    public function store(StoreThreeTogetherRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ThreeTogether::create($data);

        return $this->success($record);
    }

    public function update(UpdateThreeTogetherRequest $request, int $id): JsonResponse
    {
        $record = ThreeTogether::find($id);

        if (! $record) {
            return $this->notFound('三同时管理不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = ThreeTogether::find($id);

        if (! $record) {
            return $this->notFound('三同时管理不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
