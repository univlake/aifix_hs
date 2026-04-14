<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSpaceWorkRequest;
use App\Http\Requests\Api\V1\UpdateSpaceWorkRequest;
use App\Models\SpaceWork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpaceWorkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SpaceWork::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with('spaceWorkType')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SpaceWork::with('spaceWorkType')->find($id);

        if (! $data) {
            return $this->notFound('有限空间作业不存在');
        }

        return $this->success($data);
    }

    public function store(StoreSpaceWorkRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $spaceWork = SpaceWork::create($data);

        return $this->success($spaceWork->load('spaceWorkType'));
    }

    public function update(UpdateSpaceWorkRequest $request, int $id): JsonResponse
    {
        $spaceWork = SpaceWork::find($id);

        if (! $spaceWork) {
            return $this->notFound('有限空间作业不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $spaceWork->update($data);

        return $this->success($spaceWork->fresh(['spaceWorkType']));
    }

    public function destroy(int $id): JsonResponse
    {
        $spaceWork = SpaceWork::find($id);

        if (! $spaceWork) {
            return $this->notFound('有限空间作业不存在');
        }

        $spaceWork->delete();

        return $this->message('删除成功');
    }
}
