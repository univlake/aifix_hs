<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\InformationDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InformationDraftsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InformationDraft::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $list = $query->orderByDesc('is_top')
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = InformationDraft::find($id);

        if (!$data) {
            return $this->notFound('制度草案不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'company_id' => 'required|integer',
            'draft_department' => 'nullable|string|max:255',
            'draft_others' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'annex_url' => 'nullable|string|max:255',
            'next_reviewer' => 'nullable|integer',
            'is_top' => 'nullable|integer',
            'status' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = InformationDraft::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = InformationDraft::find($id);

        if (!$record) {
            return $this->notFound('制度草案不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer',
            'draft_department' => 'sometimes|nullable|string|max:255',
            'draft_others' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string|max:255',
            'next_reviewer' => 'sometimes|nullable|integer',
            'is_top' => 'sometimes|nullable|integer',
            'status' => 'sometimes|nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = InformationDraft::find($id);

        if (!$record) {
            return $this->notFound('制度草案不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
