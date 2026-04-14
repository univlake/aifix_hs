<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'find_date' => 'nullable|date',
            'name' => 'required|string|max:255',
            'post' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'is_true' => 'nullable|integer',
            'mechanism' => 'nullable|string|max:255',
            'identify_date' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthReport = HealthReport::create($data);

        return $this->success($healthReport);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $healthReport = HealthReport::find($id);

        if (!$healthReport) {
            return $this->notFound('职业病报告不存在');
        }

        $data = $request->validate([
            'find_date' => 'sometimes|nullable|date',
            'name' => 'sometimes|required|string|max:255',
            'post' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'is_true' => 'sometimes|nullable|integer',
            'mechanism' => 'sometimes|nullable|string|max:255',
            'identify_date' => 'sometimes|nullable|date',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

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
