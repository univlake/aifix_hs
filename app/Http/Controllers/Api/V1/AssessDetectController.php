<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreAssessDetectRequest;
use App\Http\Requests\Api\V1\UpdateAssessDetectRequest;
use App\Models\AssessDetect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessDetectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = AssessDetect::query()
            ->where('company_id', $request->company_id)
            ->when($request->name, function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->name.'%');
            })
            ->with(['skillUnit', 'skillUnitKid'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = AssessDetect::query()->with(['skillUnit', 'skillUnitKid'])->find($id);

        if (! $data) {
            return $this->notFound('安全评价和检测信息不存在');
        }

        return $this->success($data);
    }

    public function store(StoreAssessDetectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $assessDetect = AssessDetect::create($data);

        return $this->success($assessDetect);
    }

    public function update(UpdateAssessDetectRequest $request, int $id): JsonResponse
    {
        $assessDetect = AssessDetect::find($id);

        if (! $assessDetect) {
            return $this->notFound('安全评价和检测信息不存在');
        }

        $assessDetect->update(array_merge(
            $request->only(
                'name', 'assess_detect_type', 'skill_unit_id', 'skill_unit_kid_id',
                'valid_period', 'annex_url', 'company_id'
            ),
            ['last_user_id' => auth()->id() ?? 0]
        ));

        return $this->success($assessDetect);
    }

    public function destroy(int $id): JsonResponse
    {
        $assessDetect = AssessDetect::find($id);

        if (! $assessDetect) {
            return $this->notFound('安全评价和检测信息不存在');
        }

        $assessDetect->delete();

        return $this->message('删除成功', 204);
    }
}
