<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreCompanyGroupRequest;
use App\Http\Requests\Api\V1\UpdateCompanyGroupRequest;
use App\Models\CompanyGroup;
use App\Models\CompanyGroupKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyGroupController extends Controller
{
    /**
     * 分组列表（按企业隔离）
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $groups = CompanyGroup::query()
            ->where('company_id', $request->company_id)
            ->with('kidCompanies')
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($groups);
    }

    /**
     * 创建分组
     */
    public function store(StoreCompanyGroupRequest $request): JsonResponse
    {
        $group = CompanyGroup::create([
            'name' => $request->name,
            'company_id' => $request->company_id,
            'user_id' => auth()->id() ?? 0,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($group->load('kidCompanies'));
    }

    /**
     * 更新分组名称
     */
    public function update(UpdateCompanyGroupRequest $request, int $id): JsonResponse
    {
        $group = CompanyGroup::find($id);

        if (! $group) {
            return $this->notFound('分组不存在');
        }

        $group->update([
            'name' => $request->name,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($group->load('kidCompanies'));
    }

    /**
     * 删除分组（级联删除成员）
     */
    public function destroy(int $id): JsonResponse
    {
        $group = CompanyGroup::find($id);

        if (! $group) {
            return $this->notFound('分组不存在');
        }

        CompanyGroupKid::where('company_group_id', $id)->delete();
        $group->delete();

        return $this->message('删除成功');
    }

    /**
     * 同步分组成员（替换全部成员）
     */
    public function syncKids(Request $request, int $id): JsonResponse
    {
        $group = CompanyGroup::find($id);

        if (! $group) {
            return $this->notFound('分组不存在');
        }

        $request->validate(['company_ids' => 'present|array', 'company_ids.*' => 'integer']);

        CompanyGroupKid::where('company_group_id', $id)->forceDelete();

        foreach (array_unique($request->company_ids ?? []) as $companyId) {
            CompanyGroupKid::create([
                'company_group_id' => $id,
                'company_id' => (int) $companyId,
            ]);
        }

        return $this->success($group->load('kidCompanies'));
    }
}
