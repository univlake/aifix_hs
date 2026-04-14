<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ExpertInspection;
use App\Models\ExpertCompany;
use App\Models\ExpertInspectionUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreExpertInspectionsRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionsRequest;
use App\Http\Requests\Api\V1\StoreExpertCompanyRequest;
use App\Http\Requests\Api\V1\UpdateExpertCompanyRequest;
use App\Http\Requests\Api\V1\StoreExpertInspectionUserRequest;
use App\Http\Requests\Api\V1\UpdateExpertInspectionUserRequest;

class ExpertInspectionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExpertInspection::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with(['expertCompanies'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = ExpertInspection::query()
            ->with(['expertCompanies', 'expertCompanies.expertInspectionUsers'])
            ->find($id);

        if (!$data) {
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

        if (!$record) {
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

        if (!$record) {
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
            ->with(['expertInspectionUsers'])
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

        return $this->success($record);
    }

    public function updateCompany(UpdateExpertCompanyRequest $request, int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (!$record) {
            return $this->notFound('专家检查企业不存在');
        }

        $data = $request->validated();

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroyCompany(int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (!$record) {
            return $this->notFound('专家检查企业不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    // ── ExpertInspectionUser CRUD ──────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $request->validate(['expert_company_id' => 'required|integer']);

        $list = ExpertInspectionUser::query()
            ->where('expert_company_id', $request->expert_company_id)
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

        return $this->success($record);
    }

    public function updateUser(UpdateExpertInspectionUserRequest $request, int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (!$record) {
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

        if (!$record) {
            return $this->notFound('专家用户不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
