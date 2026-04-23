<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreHealthSystemRequest;
use App\Http\Requests\Api\V1\UpdateHealthSystemRequest;
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

    public function store(StoreHealthSystemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthSystem = HealthSystem::create($data);

        return $this->success($healthSystem);
    }

    public function update(UpdateHealthSystemRequest $request, int $id): JsonResponse
    {
        $healthSystem = HealthSystem::find($id);

        if (! $healthSystem) {
            return $this->notFound('职业健康体系不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $healthSystem->update($data);

        return $this->success($healthSystem->fresh());
    }
}
