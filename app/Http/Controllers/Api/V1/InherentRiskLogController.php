<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreInherentRiskLogRequest;
use App\Http\Requests\Api\V1\UpdateInherentRiskLogRequest;
use App\Models\InherentRiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InherentRiskLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InherentRiskLog::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = InherentRiskLog::find($id);

        if (! $data) {
            return $this->notFound('固有风险日志不存在');
        }

        return $this->success($data);
    }

    public function store(StoreInherentRiskLogRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $inherentRiskLog = InherentRiskLog::create($data);

        return $this->success($inherentRiskLog);
    }

    public function update(UpdateInherentRiskLogRequest $request, int $id): JsonResponse
    {
        $inherentRiskLog = InherentRiskLog::find($id);

        if (! $inherentRiskLog) {
            return $this->notFound('固有风险日志不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $inherentRiskLog->update($data);

        return $this->success($inherentRiskLog->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $inherentRiskLog = InherentRiskLog::find($id);

        if (! $inherentRiskLog) {
            return $this->notFound('固有风险日志不存在');
        }

        $inherentRiskLog->delete();

        return $this->message('删除成功');
    }
}
