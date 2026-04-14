<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ExpertInspection;
use App\Models\ExpertCompany;
use App\Models\ExpertInspectionUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'company_id' => 'required|integer',
            'description' => 'nullable|string',
            'comment' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspection::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = ExpertInspection::find($id);

        if (!$record) {
            return $this->notFound('专家检查不存在');
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer',
            'description' => 'sometimes|nullable|string',
            'comment' => 'sometimes|nullable|string',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
        ]);

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
        $request->validate(['expert_inspection_id' => 'required|integer']);

        $list = ExpertCompany::query()
            ->where('expert_inspection_id', $request->expert_inspection_id)
            ->with(['expertInspectionUsers'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function storeCompany(Request $request): JsonResponse
    {
        $data = $request->validate([
            'expert_inspection_id' => 'required|integer',
            'check_company_id' => 'required|integer',
            'company_id' => 'required|integer',
            'notify_company_time' => 'nullable|date',
            'check_company_time' => 'nullable|date',
            'status' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertCompany::create($data);

        return $this->success($record);
    }

    public function updateCompany(Request $request, int $id): JsonResponse
    {
        $record = ExpertCompany::find($id);

        if (!$record) {
            return $this->notFound('专家检查企业不存在');
        }

        $data = $request->validate([
            'notify_company_time' => 'sometimes|nullable|date',
            'check_company_time' => 'sometimes|nullable|date',
            'status' => 'sometimes|nullable|integer',
        ]);

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

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'expert_user_id' => 'required|integer',
            'expert_company_id' => 'required|integer',
            'company_id' => 'required|integer',
            'status' => 'nullable|integer',
            'comment' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ExpertInspectionUser::create($data);

        return $this->success($record);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $record = ExpertInspectionUser::find($id);

        if (!$record) {
            return $this->notFound('专家用户不存在');
        }

        $data = $request->validate([
            'status' => 'sometimes|nullable|integer',
            'comment' => 'sometimes|nullable|string',
        ]);

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
