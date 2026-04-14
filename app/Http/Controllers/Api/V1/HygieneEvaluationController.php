<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HygieneEvaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HygieneEvaluationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HygieneEvaluation::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with(['skillUnit', 'skillUnitKid'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = HygieneEvaluation::with(['skillUnit', 'skillUnitKid'])->find($id);

        if (!$data) {
            return $this->notFound('职业卫生评价不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'skill_unit_id' => 'nullable|integer',
            'skill_unit_kid_id' => 'nullable|integer',
            'valid_period' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $hygieneEvaluation = HygieneEvaluation::create($data);

        return $this->success($hygieneEvaluation->load(['skillUnit', 'skillUnitKid']));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hygieneEvaluation = HygieneEvaluation::find($id);

        if (!$hygieneEvaluation) {
            return $this->notFound('职业卫生评价不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'skill_unit_id' => 'sometimes|nullable|integer',
            'skill_unit_kid_id' => 'sometimes|nullable|integer',
            'valid_period' => 'sometimes|nullable|date',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $hygieneEvaluation->update($data);

        return $this->success($hygieneEvaluation->fresh()->load(['skillUnit', 'skillUnitKid']));
    }

    public function destroy(int $id): JsonResponse
    {
        $hygieneEvaluation = HygieneEvaluation::find($id);

        if (!$hygieneEvaluation) {
            return $this->notFound('职业卫生评价不存在');
        }

        $hygieneEvaluation->delete();

        return $this->message('删除成功');
    }
}
