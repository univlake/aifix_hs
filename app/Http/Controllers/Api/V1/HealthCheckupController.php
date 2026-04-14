<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthCheckup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthCheckupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthCheckup::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('type')) {
            $query->where('type', 'like', '%' . $request->type . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = HealthCheckup::find($id);

        if (!$data) {
            return $this->notFound('职业健康体检不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'type' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'checkup_date' => 'nullable|date',
            'checkup_expiry' => 'nullable|string',
            'measure' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthCheckup = HealthCheckup::create($data);

        return $this->success($healthCheckup);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $healthCheckup = HealthCheckup::find($id);

        if (!$healthCheckup) {
            return $this->notFound('职业健康体检不存在');
        }

        $data = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'checkup_date' => 'sometimes|nullable|date',
            'checkup_expiry' => 'sometimes|nullable|string',
            'measure' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $healthCheckup->update($data);

        return $this->success($healthCheckup->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $healthCheckup = HealthCheckup::find($id);

        if (!$healthCheckup) {
            return $this->notFound('职业健康体检不存在');
        }

        $healthCheckup->delete();

        return $this->message('删除成功');
    }
}
