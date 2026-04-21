<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreExpertCompanyRequest;
use App\Http\Requests\Api\V1\StoreExpertInspectionsRequest;
use App\Http\Requests\Api\V1\StoreExpertInspectionUserRequest;
use App\Http\Requests\Api\V1\UpdateExpertCompanyRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionsRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionUserRequest;
use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\ExpertInspectionUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpertInspectionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExpertInspection::query();

        $companyId = $request->get('company_id');
        $expertUserId = $request->get('expert_user_id');

        if ($companyId && $expertUserId) {
            $query->where(function ($q) use ($companyId, $expertUserId) {
                $q->where('company_id', $companyId)
                    ->orWhereHas('expertCompanies.expertInspectionUsers', function ($qq) use ($expertUserId) {
                        $qq->where('expert_user_id', $expertUserId);
                    });
            });
        } elseif ($companyId) {
            $query->where('company_id', $companyId);
        } elseif ($expertUserId) {
            $query->whereHas('expertCompanies.expertInspectionUsers', function ($q) use ($expertUserId) {
                $q->where('expert_user_id', $expertUserId);
            });
        }

        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->title.'%');
        }

        $list = $query->with(['expertCompanies'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = ExpertInspection::query()
            ->with([
                'expertCompanies.checkCompany:id,title',
                'expertCompanies.expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->find($id);

        if (! $data) {
            return $this->notFound('专家检查不存在');
        }

        return $this->success($data);
    }

    public function store(StoreExpertInspectionsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspection::create($data);

        return $this->success($record);
    }

    public function update(UpdateExpertInspectionsRequest $request, int $id): JsonResponse
    {
        $record = ExpertInspection::find($id);

        if (! $record) {
            return $this->notFound('专家检查不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = ExpertInspection::find($id);

        if (! $record) {
            return $this->notFound('专家检查不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    // ── ExpertCompany CRUD ──────────────────────────────

    public function companies(Request $request): JsonResponse
    {
        $list = ExpertCompany::query()
            ->where('expert_inspection_id', $request->expert_inspection_id)
            ->with([
                'checkCompany:id,title',
                'expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function storeCompany(StoreExpertCompanyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertCompany::create($data);

        return $this->success($record->load('checkCompany:id,title'));
    }

    public function updateCompany(UpdateExpertCompanyRequest $request, int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $data = $request->validated();

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh('checkCompany:id,title'));
    }

    public function destroyCompany(int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    public function confirmCompany(int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (! $record) {
            return $this->notFound('专家检查企业不存在');
        }

        $record->update([
            'confirm_time' => now(),
            'status' => 2,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($record->fresh());
    }

    /**
     * 企业端仪表板通知：尚未确认的记录（若 notify_company_time 为空按立即处理）.
     */
    public function companyNotifications(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = ExpertCompany::query()
            ->where('check_company_id', $request->company_id)
            ->whereNull('confirm_time')
            ->where(function ($q) {
                $q->whereNull('notify_company_time')
                    ->orWhere('notify_company_time', '<=', now());
            })
            ->with(['expertInspection:id,title,description,start_date,end_date'])
            ->orderByDesc('notify_company_time')
            ->get();

        return $this->success($list);
    }

    /**
     * 受检企业端：本企业所有被指定参与的专家检查记录（不走权限中间件）.
     */
    public function myCheckInspections(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = ExpertCompany::query()
            ->where('check_company_id', $request->company_id)
            ->with([
                'checkCompany:id,title',
                'expertInspection:id,title,description,start_date,end_date,company_id',
                'expertInspectionUsers.expertUser:id,nickname,phone',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 50));

        return $this->success($list);
    }

    /**
     * 专家端：本专家所有被指派的检查记录（不走权限中间件）.
     */
    public function myExpertAssignments(Request $request): JsonResponse
    {
        $userId = $request->get('expert_user_id', auth()->id());

        if (! $userId) {
            return $this->success([]);
        }

        $list = ExpertInspectionUser::query()
            ->where('expert_user_id', $userId)
            ->with([
                'expertCompany.expertInspection:id,title,description,start_date,end_date,company_id',
                'expertCompany.checkCompany:id,title',
            ])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 50));

        return $this->success($list);
    }

    // ── ExpertInspectionUser CRUD ──────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $request->validate(['expert_company_id' => 'required|integer']);

        $list = ExpertInspectionUser::query()
            ->where('expert_company_id', $request->expert_company_id)
            ->with(['expertUser:id,nickname,phone'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function storeUser(StoreExpertInspectionUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspectionUser::create($data);

        return $this->success($record->load('expertUser:id,nickname,phone'));
    }

    public function updateUser(UpdateExpertInspectionUserRequest $request, int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $data = $request->validated();

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroyUser(int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    public function confirmUser(int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (! $record) {
            return $this->notFound('专家用户不存在');
        }

        $record->update([
            'confirm_time' => now(),
            'status' => 2,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($record->fresh());
    }

    /**
     * 专家端仪表板通知：被指派但尚未确认的检查.
     */
    public function expertNotifications(Request $request): JsonResponse
    {
        $userId = $request->get('expert_user_id', auth()->id());

        if (! $userId) {
            return $this->success([]);
        }

        $list = ExpertInspectionUser::query()
            ->where('expert_user_id', $userId)
            ->whereNull('confirm_time')
            ->with([
                'expertCompany.expertInspection:id,title,description,start_date,end_date',
                'expertCompany.checkCompany:id,title',
            ])
            ->orderByDesc('id')
            ->get();

        return $this->success($list);
    }
}
