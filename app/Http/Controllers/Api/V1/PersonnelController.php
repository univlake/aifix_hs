<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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

        if (!$personnel) {
            return $this->notFound('人员信息不存在');
        }

        return $this->success($personnel);
    }

    /**
     * 创建人员
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'total_people' => 'nullable|integer|min:0',
            'staff' => 'nullable|integer|min:0',
            'service' => 'nullable|integer|min:0',
            'manager' => 'nullable|integer|min:0',
            'high_school_diploma' => 'nullable|integer|min:0',
            'security_officer' => 'nullable|integer|min:0',
            'safety_engineer' => 'nullable|integer|min:0',
            'safety_engineering_major' => 'nullable|integer|min:0',
            'fire_engineer' => 'nullable|integer|min:0',
            'other' => 'nullable|integer|min:0',
            'company_id' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $personnel = Personnel::create($data);

        return $this->success($personnel);
    }

    /**
     * 更新人员
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return $this->notFound('人员信息不存在');
        }

        $data = $request->validate([
            'total_people' => 'nullable|integer|min:0',
            'staff' => 'nullable|integer|min:0',
            'service' => 'nullable|integer|min:0',
            'manager' => 'nullable|integer|min:0',
            'high_school_diploma' => 'nullable|integer|min:0',
            'security_officer' => 'nullable|integer|min:0',
            'safety_engineer' => 'nullable|integer|min:0',
            'safety_engineering_major' => 'nullable|integer|min:0',
            'fire_engineer' => 'nullable|integer|min:0',
            'other' => 'nullable|integer|min:0',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $personnel->update($data);

        return $this->success($personnel->fresh());
    }

    /**
     * 删除人员
     */
    public function destroy(int $id): JsonResponse
    {
        $personnel = Personnel::find($id);

        if (!$personnel) {
            return $this->notFound('人员信息不存在');
        }

        $personnel->delete();

        return $this->message('删除成功');
    }
}
