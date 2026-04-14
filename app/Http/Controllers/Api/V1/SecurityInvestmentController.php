<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SecurityInvestment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityInvestmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SecurityInvestment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SecurityInvestment::find($id);

        if (!$data) {
            return $this->notFound('安全投入计划不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'year' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'last_year_income' => 'nullable|numeric',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = SecurityInvestment::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = SecurityInvestment::find($id);

        if (!$record) {
            return $this->notFound('安全投入计划不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'year' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'title' => 'sometimes|nullable|string|max:255',
            'content' => 'sometimes|nullable|string',
            'budget' => 'sometimes|nullable|numeric',
            'last_year_income' => 'sometimes|nullable|numeric',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = SecurityInvestment::find($id);

        if (!$record) {
            return $this->notFound('安全投入计划不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
