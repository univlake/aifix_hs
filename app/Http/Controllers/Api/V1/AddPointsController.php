<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AddPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreAddPointsRequest;
use App\Http\Requests\Api\V1\UpdateAddPointsRequest;

class AddPointsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AddPoint::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('addPointsTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = AddPoint::with('addPointsTemplate')->find($id);

        if (!$data) {
            return $this->notFound('加分项记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreAddPointsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = AddPoint::create($data);

        return $this->success($record);
    }

    public function update(UpdateAddPointsRequest $request, int $id): JsonResponse
    {
        $record = AddPoint::find($id);

        if (!$record) {
            return $this->notFound('加分项记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = AddPoint::find($id);

        if (!$record) {
            return $this->notFound('加分项记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
