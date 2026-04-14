<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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

        if (!$data) {
            return $this->notFound('有限空间作业不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'space_work_type_id' => 'nullable|integer',
            'size' => 'nullable|string|max:255',
            'word_content' => 'nullable|string',
            'people_num' => 'nullable|integer',
            'hazard_id' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $spaceWork = SpaceWork::create($data);

        return $this->success($spaceWork->load('spaceWorkType'));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $spaceWork = SpaceWork::find($id);

        if (!$spaceWork) {
            return $this->notFound('有限空间作业不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'space_work_type_id' => 'sometimes|nullable|integer',
            'size' => 'sometimes|nullable|string|max:255',
            'word_content' => 'sometimes|nullable|string',
            'people_num' => 'sometimes|nullable|integer',
            'hazard_id' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $spaceWork->update($data);

        return $this->success($spaceWork->fresh()->load('spaceWorkType'));
    }

    public function destroy(int $id): JsonResponse
    {
        $spaceWork = SpaceWork::find($id);

        if (!$spaceWork) {
            return $this->notFound('有限空间作业不存在');
        }

        $spaceWork->delete();

        return $this->message('删除成功');
    }
}
