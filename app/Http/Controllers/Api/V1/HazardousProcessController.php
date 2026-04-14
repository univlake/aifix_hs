<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\HazardousProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'process_type_id' => 'nullable|integer',
            'position' => 'nullable|string|max:255',
            'hazardous_chemical_id' => 'nullable|integer',
            'dangerous_equipment_id' => 'nullable|integer',
            'other_equipment_name' => 'nullable|string|max:255',
            'operating_people_num' => 'nullable|integer',
            'is_online_test' => 'nullable|integer',
            'is_automatic' => 'nullable|integer',
            'is_control' => 'nullable|integer',
            'is_dust' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $hazardousProcess = HazardousProcess::create($data);

        return $this->success($hazardousProcess->load(['processType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hazardousProcess = HazardousProcess::find($id);

        if (!$hazardousProcess) {
            return $this->notFound('危险化工工艺不存在');
        }

        $data = $request->validate([
            'process_type_id' => 'sometimes|nullable|integer',
            'position' => 'sometimes|nullable|string|max:255',
            'hazardous_chemical_id' => 'sometimes|nullable|integer',
            'dangerous_equipment_id' => 'sometimes|nullable|integer',
            'other_equipment_name' => 'sometimes|nullable|string|max:255',
            'operating_people_num' => 'sometimes|nullable|integer',
            'is_online_test' => 'sometimes|nullable|integer',
            'is_automatic' => 'sometimes|nullable|integer',
            'is_control' => 'sometimes|nullable|integer',
            'is_dust' => 'sometimes|nullable|integer',
            'company_id' => 'sometimes|required|integer',
        ]);

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
