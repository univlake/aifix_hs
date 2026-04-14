<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ChecklistLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreChecklistLibraryRequest;
use App\Http\Requests\Api\V1\UpdateChecklistLibraryRequest;

class ChecklistLibraryController extends Controller
{
    /**
     * 检查清单库列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = ChecklistLibrary::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建检查清单库
     */
    public function store(StoreChecklistLibraryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = ChecklistLibrary::create($data);

        return $this->success($type);
    }

    /**
     * 更新检查清单库
     */
    public function update(UpdateChecklistLibraryRequest $request, int $id): JsonResponse
    {
        $type = ChecklistLibrary::find($id);

        if (!$type) {
            return $this->notFound('检查清单库不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除检查清单库
     */
    public function destroy(int $id): JsonResponse
    {
        $type = ChecklistLibrary::find($id);

        if (!$type) {
            return $this->notFound('检查清单库不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
