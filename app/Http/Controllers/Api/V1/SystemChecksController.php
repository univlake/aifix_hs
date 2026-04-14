<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SystemCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SystemCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SystemCheck::with('company:id,title')->find($id);

        if (!$data) {
            return $this->notFound('系统考核记录不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number_v1' => 'nullable|numeric',
            'number_v2' => 'nullable|numeric',
            'number_v3' => 'nullable|numeric',
            'number_v4' => 'nullable|numeric',
            'number_v5' => 'nullable|numeric',
            'number' => 'nullable|integer',
            'year' => 'required|integer',
            'company_id' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = SystemCheck::create($data);

        return $this->success($record);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = SystemCheck::find($id);

        if (!$record) {
            return $this->notFound('系统考核记录不存在');
        }

        $data = $request->validate([
            'number_v1' => 'sometimes|nullable|numeric',
            'number_v2' => 'sometimes|nullable|numeric',
            'number_v3' => 'sometimes|nullable|numeric',
            'number_v4' => 'sometimes|nullable|numeric',
            'number_v5' => 'sometimes|nullable|numeric',
            'number' => 'sometimes|nullable|integer',
            'year' => 'sometimes|required|integer',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = SystemCheck::find($id);

        if (!$record) {
            return $this->notFound('系统考核记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
