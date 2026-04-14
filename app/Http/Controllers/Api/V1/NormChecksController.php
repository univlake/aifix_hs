<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\NormCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NormChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NormCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = NormCheck::with('company:id,title')->find($id);

        if (!$data) {
            return $this->notFound('标准化检查记录不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'path' => 'nullable|string',
            'number' => 'nullable|integer',
            'year' => 'required|integer',
            'type' => 'required|string',
            'company_id' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = NormCheck::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = NormCheck::find($id);

        if (!$record) {
            return $this->notFound('标准化检查记录不存在');
        }

        $data = $request->validate([
            'path' => 'sometimes|nullable|string',
            'number' => 'sometimes|nullable|integer',
            'year' => 'sometimes|required|integer',
            'type' => 'sometimes|required|string',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = NormCheck::find($id);

        if (!$record) {
            return $this->notFound('标准化检查记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
