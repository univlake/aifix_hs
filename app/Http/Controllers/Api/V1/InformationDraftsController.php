<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreInformationDraftsRequest;
use App\Http\Requests\Api\V1\UpdateInformationDraftsRequest;
use App\Models\Company;
use App\Models\InformationDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InformationDraftsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InformationDraft::query();

        if ($request->filled('company_id')) {
            $companyId = (int) $request->company_id;
            $scope = $request->input('scope');

            if ($scope === 'published') {
                // Drafts I published myself (authored by me and owned by me — not reported out).
                $query->where('company_id', $companyId)
                    ->where('next_reviewer', $companyId);
            } elseif ($scope === 'received') {
                // Everything visible to me that I did not author myself:
                //   - Reports from subordinates (next_reviewer = me, company_id != me)
                //   - Published drafts from any ancestor (status = 1)
                $ancestors = $this->ancestorChain($companyId);
                $upstream = array_values(array_filter($ancestors, fn ($id) => $id !== $companyId));

                $query->where(function ($q) use ($companyId, $upstream) {
                    $q->where(function ($inner) use ($companyId) {
                        $inner->where('next_reviewer', $companyId)
                            ->where('company_id', '!=', $companyId);
                    });

                    if (! empty($upstream)) {
                        $q->orWhere(function ($inner) use ($upstream) {
                            $inner->whereIn('next_reviewer', $upstream)
                                ->where('status', 1);
                        });
                    }
                });
            } else {
                // General visibility: owned by viewer (any status) OR published upstream (status=1).
                $ancestors = $this->ancestorChain($companyId);
                $query->where(function ($q) use ($ancestors, $companyId) {
                    $q->where('next_reviewer', $companyId)
                        ->orWhere(function ($inner) use ($ancestors, $companyId) {
                            $inner->whereIn('next_reviewer', $ancestors)
                                ->where('next_reviewer', '!=', $companyId)
                                ->where('status', 1);
                        });
                });
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->orderByDesc('is_top')
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 仪表板阅读列表：已发布且面向本企业树的稿件（next_reviewer 在本企业祖先链上，status=1）。
     *
     * 覆盖三种来源：
     *   - 自己发布的稿件
     *   - 上级企业发布的稿件
     *   - 下级上报、由上级复核发布的稿件（company_id 与 next_reviewer 不同）
     */
    public function dashboardReadings(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);
        $companyId = (int) $request->company_id;
        $ancestors = $this->ancestorChain($companyId);

        $list = InformationDraft::query()
            ->whereIn('next_reviewer', $ancestors)
            ->where('status', 1)
            ->orderByDesc('is_top')
            ->orderByDesc('id')
            ->limit((int) $request->get('limit', 6))
            ->get();

        return $this->success($list);
    }

    /**
     * 仪表板待办：下级上报且尚未处理（status=0）的稿件。
     */
    public function dashboardPending(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);
        $companyId = (int) $request->company_id;

        $list = InformationDraft::query()
            ->where('next_reviewer', $companyId)
            ->where('company_id', '!=', $companyId)
            ->where('status', 0)
            ->orderByDesc('id')
            ->limit((int) $request->get('limit', 10))
            ->get();

        return $this->success($list);
    }

    /**
     * Build the ancestor chain (inclusive) for a company by walking `pid` until 0.
     *
     * @return array<int>
     */
    protected function ancestorChain(int $companyId): array
    {
        $chain = [$companyId];
        $current = Company::find($companyId);
        $guard = 0;
        while ($current && $current->pid > 0 && $guard++ < 32) {
            $chain[] = (int) $current->pid;
            $current = Company::find($current->pid);
        }

        return $chain;
    }

    public function show(int $id): JsonResponse
    {
        $data = InformationDraft::find($id);

        if (! $data) {
            return $this->notFound('制度草案不存在');
        }

        return $this->success($data);
    }

    public function store(StoreInformationDraftsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = InformationDraft::create($data);

        return $this->success($record);
    }

    public function update(UpdateInformationDraftsRequest $request, int $id): JsonResponse
    {
        $record = InformationDraft::find($id);

        if (! $record) {
            return $this->notFound('制度草案不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = InformationDraft::find($id);

        if (! $record) {
            return $this->notFound('制度草案不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
