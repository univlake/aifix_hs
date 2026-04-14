<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreHealthFileRequest;
use App\Http\Requests\Api\V1\UpdateHealthFileRequest;

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

    public function store(StoreHealthFileRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthFile = HealthFile::create($data);

        return $this->success($healthFile);
    }

    public function update(UpdateHealthFileRequest $request, int $id): JsonResponse
    {
        $healthFile = HealthFile::find($id);

        if (!$healthFile) {
            return $this->notFound('健康档案不存在');
        }
        $data = $request->validated();
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
