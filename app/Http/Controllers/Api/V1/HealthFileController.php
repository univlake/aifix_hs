<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthFile::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = HealthFile::find($id);

        if (!$data) {
            return $this->notFound('健康档案不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'number' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'post' => 'nullable|string|max:255',
            'checkup_date' => 'nullable|date',
            'checkup_expiry' => 'nullable|string',
            'review_situation' => 'nullable|string|max:255',
            'handling_opinions' => 'nullable|string|max:255',
            'process_result' => 'nullable|string|max:255',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthFile = HealthFile::create($data);

        return $this->success($healthFile);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $healthFile = HealthFile::find($id);

        if (!$healthFile) {
            return $this->notFound('健康档案不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'number' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'post' => 'sometimes|nullable|string|max:255',
            'checkup_date' => 'sometimes|nullable|date',
            'checkup_expiry' => 'sometimes|nullable|string',
            'review_situation' => 'sometimes|nullable|string|max:255',
            'handling_opinions' => 'sometimes|nullable|string|max:255',
            'process_result' => 'sometimes|nullable|string|max:255',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $healthFile->update($data);

        return $this->success($healthFile->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $healthFile = HealthFile::find($id);

        if (!$healthFile) {
            return $this->notFound('健康档案不存在');
        }

        $healthFile->delete();

        return $this->message('删除成功');
    }
}
