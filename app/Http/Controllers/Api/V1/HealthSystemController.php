<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HealthSystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthSystemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthSystem::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->first();

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'certification_time' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthSystem = HealthSystem::create($data);

        return $this->success($healthSystem);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $healthSystem = HealthSystem::find($id);

        if (!$healthSystem) {
            return $this->notFound('职业健康体系不存在');
        }

        $data = $request->validate([
            'certification_time' => 'sometimes|nullable|date',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $healthSystem->update($data);

        return $this->success($healthSystem->fresh());
    }
}
