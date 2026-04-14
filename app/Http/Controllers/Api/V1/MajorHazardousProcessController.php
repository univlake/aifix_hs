<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreMajorHazardousProcessRequest;
use App\Http\Requests\Api\V1\UpdateMajorHazardousProcessRequest;
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

        if (! $data) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }

        return $this->success($data);
    }

    public function store(StoreMajorHazardousProcessRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $majorHazardousProcess = MajorHazardousProcess::create($data);

        return $this->success($majorHazardousProcess->load(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function update(UpdateMajorHazardousProcessRequest $request, int $id): JsonResponse
    {
        $majorHazardousProcess = MajorHazardousProcess::find($id);

        if (! $majorHazardousProcess) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $majorHazardousProcess->update($data);

        return $this->success($majorHazardousProcess->fresh(['dangerousCraftType', 'hazardousChemical', 'dangerousEquipment']));
    }

    public function destroy(int $id): JsonResponse
    {
        $majorHazardousProcess = MajorHazardousProcess::find($id);

        if (! $majorHazardousProcess) {
            return $this->notFound('重点监管危险化工工艺不存在');
        }

        $majorHazardousProcess->delete();

        return $this->message('删除成功');
    }
}
