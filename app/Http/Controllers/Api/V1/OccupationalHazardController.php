<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\OccupationalHazard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OccupationalHazardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OccupationalHazard::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->filled('is_declare')) {
            $query->where('is_declare', $request->is_declare);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = OccupationalHazard::find($id);

        if (!$data) {
            return $this->notFound('职业危害清单不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'is_declare' => 'nullable|string|max:255',
            'declare_date' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $occupationalHazard = OccupationalHazard::create($data);

        return $this->success($occupationalHazard);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $occupationalHazard = OccupationalHazard::find($id);

        if (!$occupationalHazard) {
            return $this->notFound('职业危害清单不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'is_declare' => 'sometimes|nullable|string|max:255',
            'declare_date' => 'sometimes|nullable|date',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $occupationalHazard->update($data);

        return $this->success($occupationalHazard->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $occupationalHazard = OccupationalHazard::find($id);

        if (!$occupationalHazard) {
            return $this->notFound('职业危害清单不存在');
        }

        $occupationalHazard->delete();

        return $this->message('删除成功');
    }
}
