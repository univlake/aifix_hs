<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreHealthReportRequest;
use App\Http\Requests\Api\V1\UpdateHealthReportRequest;

class HealthReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthReport::query();

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
        $data = HealthReport::find($id);

        if (!$data) {
            return $this->notFound('职业病报告不存在');
        }

        return $this->success($data);
    }

    public function store(StoreHealthReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthReport = HealthReport::create($data);

        return $this->success($healthReport);
    }

    public function update(UpdateHealthReportRequest $request, int $id): JsonResponse
    {
        $healthReport = HealthReport::find($id);

        if (!$healthReport) {
            return $this->notFound('职业病报告不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $healthReport->update($data);

        return $this->success($healthReport->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $healthReport = HealthReport::find($id);

        if (!$healthReport) {
            return $this->notFound('职业病报告不存在');
        }

        $healthReport->delete();

        return $this->message('删除成功');
    }
}
