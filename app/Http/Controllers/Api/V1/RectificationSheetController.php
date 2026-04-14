<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RectificationSheet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreRectificationSheetRequest;
use App\Http\Requests\Api\V1\UpdateRectificationSheetRequest;

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

    public function store(StoreRectificationSheetRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;

        $rectificationSheet = RectificationSheet::create($data);

        return $this->success($rectificationSheet);
    }

    public function update(UpdateRectificationSheetRequest $request, int $id): JsonResponse
    {
        $rectificationSheet = RectificationSheet::find($id);

        if (!$rectificationSheet) {
            return $this->notFound('整改单不存在');
        }
        $data = $request->validated();
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
