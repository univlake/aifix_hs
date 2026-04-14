<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\InformationDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreInformationDraftsRequest;
use App\Http\Requests\Api\V1\UpdateInformationDraftsRequest;

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

        if (!$record) {
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

        if (!$record) {
            return $this->notFound('制度草案不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
