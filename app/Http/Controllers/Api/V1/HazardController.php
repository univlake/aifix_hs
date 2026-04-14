<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Hazard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreHazardRequest;
use App\Http\Requests\Api\V1\UpdateHazardRequest;

class HazardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Hazard::query();

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = Hazard::find($id);

        if (!$data) {
            return $this->notFound('危险有害因素不存在');
        }

        return $this->success($data);
    }

    public function store(StoreHazardRequest $request): JsonResponse
    {
        $data = $request->validated();
        $hazard = Hazard::create($data);

        return $this->success($hazard);
    }

    public function update(UpdateHazardRequest $request, int $id): JsonResponse
    {
        $hazard = Hazard::find($id);

        if (!$hazard) {
            return $this->notFound('危险有害因素不存在');
        }
        $data = $request->validated();
        $hazard->update($data);

        return $this->success($hazard->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $hazard = Hazard::find($id);

        if (!$hazard) {
            return $this->notFound('危险有害因素不存在');
        }

        $hazard->delete();

        return $this->message('删除成功');
    }
}
