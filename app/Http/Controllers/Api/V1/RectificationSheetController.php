<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RectificationSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RectificationSheetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RectificationSheet::query();

        if ($request->filled('expert_inspection_id')) {
            $query->where('expert_inspection_id', $request->expert_inspection_id);
        }
        if ($request->filled('check_company_id')) {
            $query->where('check_company_id', $request->check_company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = RectificationSheet::find($id);

        if (!$data) {
            return $this->notFound('整改单不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'expert_inspection_id' => 'required|integer',
            'check_company_id' => 'required|integer',
            'sheet_name' => 'required|integer',
            'path' => 'required|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;

        $rectificationSheet = RectificationSheet::create($data);

        return $this->success($rectificationSheet);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rectificationSheet = RectificationSheet::find($id);

        if (!$rectificationSheet) {
            return $this->notFound('整改单不存在');
        }

        $data = $request->validate([
            'expert_inspection_id' => 'sometimes|nullable|integer',
            'check_company_id' => 'sometimes|nullable|integer',
            'sheet_name' => 'sometimes|nullable|integer',
            'path' => 'sometimes|nullable|string',
        ]);

        $rectificationSheet->update($data);

        return $this->success($rectificationSheet->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $rectificationSheet = RectificationSheet::find($id);

        if (!$rectificationSheet) {
            return $this->notFound('整改单不存在');
        }

        $rectificationSheet->delete();

        return $this->message('删除成功');
    }
}
