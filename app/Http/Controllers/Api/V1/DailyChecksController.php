<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DailyCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DailyCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('dailyCheckTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = DailyCheck::with('dailyCheckTemplate')->find($id);

        if (!$data) {
            return $this->notFound('日常检查记录不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'daily_check_template_id' => 'required|integer',
            'path' => 'nullable|string',
            'number' => 'nullable|integer',
            'comment' => 'nullable|string',
            'company_id' => 'required|integer',
            'year' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = DailyCheck::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = DailyCheck::find($id);

        if (!$record) {
            return $this->notFound('日常检查记录不存在');
        }

        $data = $request->validate([
            'daily_check_template_id' => 'sometimes|required|integer',
            'path' => 'sometimes|nullable|string',
            'number' => 'sometimes|nullable|integer',
            'comment' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
            'year' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = DailyCheck::find($id);

        if (!$record) {
            return $this->notFound('日常检查记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
