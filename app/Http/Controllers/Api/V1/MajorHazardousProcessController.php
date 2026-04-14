<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\MajorHazardousProcess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MajorHazardousProcessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MajorHazardousProcess::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = MajorHazardousProcess::with(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment'])->find($id);

        if (!$data) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'dangerous_craft_type_id' => 'nullable|integer',
            'position' => 'nullable|string|max:255',
            'hazardous_chemical_id' => 'nullable|integer',
            'dangerous_equipment_id' => 'nullable|integer',
            'operating_people_num' => 'nullable|integer',
            'temperature' => 'nullable|string|max:255',
            'pressure' => 'nullable|string|max:255',
            'pressure_unit' => 'nullable|string|max:255',
            'is_sis' => 'nullable|integer',
            'sil_level' => 'nullable|string|max:255',
            'detect_parameter' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $majorHazardousProcess = MajorHazardousProcess::create($data);

        return $this->success($majorHazardousProcess->load(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $majorHazardousProcess = MajorHazardousProcess::find($id);

        if (!$majorHazardousProcess) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }

        $data = $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'dangerous_craft_type_id' => 'sometimes|nullable|integer',
            'position' => 'sometimes|nullable|string|max:255',
            'hazardous_chemical_id' => 'sometimes|nullable|integer',
            'dangerous_equipment_id' => 'sometimes|nullable|integer',
            'operating_people_num' => 'sometimes|nullable|integer',
            'temperature' => 'sometimes|nullable|string|max:255',
            'pressure' => 'sometimes|nullable|string|max:255',
            'pressure_unit' => 'sometimes|nullable|string|max:255',
            'is_sis' => 'sometimes|nullable|integer',
            'sil_level' => 'sometimes|nullable|string|max:255',
            'detect_parameter' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $majorHazardousProcess->update($data);

        return $this->success($majorHazardousProcess->fresh()->load(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function destroy(int $id): JsonResponse
    {
        $majorHazardousProcess = MajorHazardousProcess::find($id);

        if (!$majorHazardousProcess) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }

        $majorHazardousProcess->delete();

        return $this->message('删除成功');
    }
}
