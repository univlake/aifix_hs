<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Hazard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $hazard = Hazard::create($data);

        return $this->success($hazard);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hazard = Hazard::find($id);

        if (!$hazard) {
            return $this->notFound('危险有害因素不存在');
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
        ]);

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
