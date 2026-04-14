<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StorePersonnelRequest;
use App\Http\Requests\Api\V1\UpdatePersonnelRequest;
use App\Http\Resources\Api\V1\PersonnelResource;
use App\Models\Personnel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    /**
     * 人员列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = Personnel::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 人员详情
     */
    public function show(int $id): JsonResponse
    {
        $personnel = Personnel::query()
            ->with('company:id,title')
            ->find($id);

        if (! $personnel) {
            return $this->notFound('人员信息不存在');
        }

        return $this->success(new PersonnelResource($personnel));
    }

    /**
     * 创建人员
     */
    public function store(StorePersonnelRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $personnel = Personnel::create($data);

        return $this->success($personnel);
    }

    /**
     * 更新人员
     */
    public function update(UpdatePersonnelRequest $request, int $id): JsonResponse
    {
        $personnel = Personnel::find($id);

        if (! $personnel) {
            return $this->notFound('人员信息不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $personnel->update($data);

        return $this->success(new PersonnelResource($personnel->fresh()));
    }

    /**
     * 删除人员
     */
    public function destroy(int $id): JsonResponse
    {
        $personnel = Personnel::find($id);

        if (! $personnel) {
            return $this->notFound('人员信息不存在');
        }

        $personnel->delete();

        return $this->message('删除成功');
    }
}
