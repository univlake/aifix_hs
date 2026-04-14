<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DoubleCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreDoubleChecksRequest;
use App\Http\Requests\Api\V1\UpdateDoubleChecksRequest;

class DoubleChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DoubleCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('doubleCheckTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = DoubleCheck::with('doubleCheckTemplate')->find($id);

        if (!$data) {
            return $this->notFound('双重预防检查记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreDoubleChecksRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = DoubleCheck::create($data);

        return $this->success($record);
    }

    public function update(UpdateDoubleChecksRequest $request, int $id): JsonResponse
    {
        $record = DoubleCheck::find($id);

        if (!$record) {
            return $this->notFound('双重预防检查记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = DoubleCheck::find($id);

        if (!$record) {
            return $this->notFound('双重预防检查记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
