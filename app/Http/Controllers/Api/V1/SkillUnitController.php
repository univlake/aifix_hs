<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SkillUnit;
use App\Models\SkillUnitKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SkillUnitController extends Controller
{
    /**
     * 施工单位列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = SkillUnit::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with(['kids'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 施工单位详情
     */
    public function show(int $id): JsonResponse
    {
        $record = SkillUnit::with(['kids'])->find($id);

        if (!$record) {
            return $this->notFound('施工单位不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建施工单位
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'serving_type' => 'required|string|max:255',
            'is_qualification' => 'nullable|integer',
            'evaluation_area' => 'nullable|string',
            'contact' => 'nullable|string|max:255',
            'contact_tel' => 'nullable|string|max:255',
            'kids' => 'nullable|array',
            'kids.*.qualification_name' => 'nullable|string|max:255',
            'kids.*.qualification_annex_url' => 'nullable|string',
        ]);

        $kids = $data['kids'] ?? [];
        unset($data['kids']);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = DB::transaction(function () use ($data, $kids) {
            $skillUnit = SkillUnit::create($data);

            foreach ($kids as $kid) {
                $kid['skill_unit_id'] = $skillUnit->id;
                $kid['company_id'] = $data['company_id'];
                $kid['user_id'] = $data['user_id'];
                $kid['last_user_id'] = $data['last_user_id'];
                SkillUnitKid::create($kid);
            }

            return $skillUnit->fresh(['kids']);
        });

        return $this->success($record);
    }

    /**
     * 更新施工单位
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $skillUnit = SkillUnit::find($id);

        if (!$skillUnit) {
            return $this->notFound('施工单位不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:255',
            'serving_type' => 'sometimes|required|string|max:255',
            'is_qualification' => 'nullable|integer',
            'evaluation_area' => 'nullable|string',
            'contact' => 'nullable|string|max:255',
            'contact_tel' => 'nullable|string|max:255',
            'kids' => 'nullable|array',
            'kids.*.qualification_name' => 'nullable|string|max:255',
            'kids.*.qualification_annex_url' => 'nullable|string',
        ]);

        $kids = $data['kids'] ?? [];
        unset($data['kids']);

        $data['last_user_id'] = auth()->id() ?? 0;

        DB::transaction(function () use ($skillUnit, $data, $kids) {
            $skillUnit->update($data);

            $skillUnit->kids()->delete();

            foreach ($kids as $kid) {
                $kid['skill_unit_id'] = $skillUnit->id;
                $kid['company_id'] = $skillUnit->company_id;
                $kid['user_id'] = $skillUnit->user_id;
                $kid['last_user_id'] = $data['last_user_id'];
                SkillUnitKid::create($kid);
            }
        });

        return $this->success($skillUnit->fresh(['kids']));
    }

    /**
     * 删除施工单位
     */
    public function destroy(int $id): JsonResponse
    {
        $skillUnit = SkillUnit::find($id);

        if (!$skillUnit) {
            return $this->notFound('施工单位不存在');
        }

        DB::transaction(function () use ($skillUnit) {
            $skillUnit->kids()->delete();
            $skillUnit->delete();
        });

        return $this->message('删除成功');
    }
}
