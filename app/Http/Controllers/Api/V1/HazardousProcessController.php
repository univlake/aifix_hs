<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HazardousProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreHazardousProcessRequest;
use App\Http\Requests\Api\V1\UpdateHazardousProcessRequest;

class HazardousProcessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HazardousProcess::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with(['processType', 'hazardousChemical', 'dangerousEquipment'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = HazardousProcess::with(['processType', 'hazardousChemical', 'dangerousEquipment'])->find($id);

        if (!$data) {
            return $this->notFound('危险化工工艺不存在');
        }

        return $this->success($data);
    }

    public function store(StoreHazardousProcessRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $hazardousProcess = HazardousProcess::create($data);

        return $this->success($hazardousProcess->load(['processType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function update(UpdateHazardousProcessRequest $request, int $id): JsonResponse
    {
        $hazardousProcess = HazardousProcess::find($id);

        if (!$hazardousProcess) {
            return $this->notFound('危险化工工艺不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $hazardousProcess->update($data);

        return $this->success($hazardousProcess->fresh()->load(['processType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function destroy(int $id): JsonResponse
    {
        $hazardousProcess = HazardousProcess::find($id);

        if (!$hazardousProcess) {
            return $this->notFound('危险化工工艺不存在');
        }

        $hazardousProcess->delete();

        return $this->message('删除成功');
    }
}
