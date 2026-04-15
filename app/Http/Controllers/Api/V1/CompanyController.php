<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreCompanyRequest;
use App\Http\Requests\Api\V1\UpdateCompanyRequest;
use App\Models\Company;
use App\Traits\ApiTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CompanyController extends Controller
{
    use ApiTree;

    /**
     * 公开企业列表 — 注册时选择所属企业用，无需认证
     * 仅返回 id + title，不暴露其他字段
     */
    public function publicList(): JsonResponse
    {
        $companies = Company::query()
            ->where('status', 1)
            ->orderBy('id')
            ->get(['id', 'title']);

        return $this->success($companies);
    }

    /**
     * 企业列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::query();

        // 搜索
        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->title.'%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('enterprise_type_id')) {
            $query->where('enterprise_type_id', $request->enterprise_type_id);
        }

        if ($request->filled('operational_type_id')) {
            $query->where('operational_type_id', $request->operational_type_id);
        }

        // 层级过滤：如果有 pid，只获取该企业的下属
        if ($request->filled('pid')) {
            $query->where('pid', $request->pid);
        }

        $list = $query->with(['enterpriseType', 'operationalType', 'pidName'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 企业详情
     */
    public function show(int $id): JsonResponse
    {
        $company = Company::query()
            ->with(['enterpriseType', 'operationalType', 'baseArea', 'users', 'pidName'])
            ->find($id);

        if (! $company) {
            return $this->notFound('企业不存在');
        }

        return $this->success($company);
    }

    /**
     * 创建企业
     */
    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;

        $company = Company::create($data);

        return $this->success($company);
    }

    /**
     * 更新企业
     */
    public function update(UpdateCompanyRequest $request, int $id): JsonResponse
    {
        $company = Company::find($id);

        if (! $company) {
            return $this->notFound('企业不存在');
        }

        Gate::authorize('update', $company);
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $company->update($data);

        // Flush hierarchy cache so downstream childId() / getCompanyId() calls
        // reflect the new pid/status/is_produce values immediately.
        Controller::flushCompanyHierarchyCache($company->id);
        if ($company->pid) {
            Controller::flushCompanyHierarchyCache($company->pid);
        }

        return $this->success($company->fresh());
    }

    /**
     * 删除企业
     */
    public function destroy(int $id): JsonResponse
    {
        $company = Company::find($id);

        if (! $company) {
            return $this->notFound('企业不存在');
        }

        Gate::authorize('delete', $company);

        $company->delete();

        Controller::flushCompanyHierarchyCache($company->id);
        if ($company->pid) {
            Controller::flushCompanyHierarchyCache($company->pid);
        }

        return $this->message('删除成功');
    }

    /**
     * 企业树
     */
    public function tree(Request $request): JsonResponse
    {
        $query = Company::query()->where('status', 1);

        if ($request->filled('pid')) {
            $query->where('pid', $request->pid);
        } else {
            $query->where('pid', 0);
        }

        $companies = $query->with('companies:id,title,pid,status')
            ->select(['id', 'title', 'pid', 'status'])
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($companies);
    }

    /**
     * 审核列表
     */
    public function reviewList(Request $request): JsonResponse
    {
        $query = Company::query()->where('status', 0);

        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->title.'%');
        }

        $list = $query->with(['enterpriseType', 'operationalType'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 审核
     */
    public function review(Request $request, int $id): JsonResponse
    {
        $company = Company::find($id);

        if (! $company) {
            return $this->notFound('企业不存在');
        }

        Gate::authorize('review', $company);

        $company->update([
            'status' => $request->status,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->message('审核成功');
    }
}
