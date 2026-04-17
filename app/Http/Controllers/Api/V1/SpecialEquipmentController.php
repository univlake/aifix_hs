<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\SpecialEquipmentExport;
use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSpecialEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateSpecialEquipmentRequest;
use App\Imports\SpecialEquipmentImport;
use App\Models\SpecialEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SpecialEquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SpecialEquipment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%'.$request->equipment_name.'%');
        }

        if ($request->filled('special_type_id')) {
            $query->where('special_type_id', $request->special_type_id);
        }

        $list = $query->with('specialType')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SpecialEquipment::with('specialType')->find($id);

        if (! $data) {
            return $this->notFound('特种设备不存在');
        }

        return $this->success($data);
    }

    public function store(StoreSpecialEquipmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipment = SpecialEquipment::create($data);

        return $this->success($specialEquipment);
    }

    public function update(UpdateSpecialEquipmentRequest $request, int $id): JsonResponse
    {
        $specialEquipment = SpecialEquipment::find($id);

        if (! $specialEquipment) {
            return $this->notFound('特种设备不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $specialEquipment->update($data);

        return $this->success($specialEquipment->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $specialEquipment = SpecialEquipment::find($id);

        if (! $specialEquipment) {
            return $this->notFound('特种设备不存在');
        }

        $specialEquipment->delete();

        return $this->message('删除成功');
    }

    /**
     * 下载导入模板
     */
    public function template(): BinaryFileResponse
    {
        $export = new StaffTemplateExport(
            headings: [
                '设备名称*', '设备类型ID(1-6)', '使用位置', '使用证编号/场内机动车牌证',
                '规格型号一', '规格型号二', '规格型号三', '规格型号四',
                '投用时间(YYYY-MM-DD)', '检验有效期(YYYY-MM-DD)', '检验单位', '维护信息', '备注',
            ],
            examples: [[
                '压缩空气储罐', 2, '生产车间A', 'Y2024001',
                '1.6', '5', '空气', '',
                '2020-01-01', '2026-12-31', '某检验机构', '', '',
            ]],
        );

        return Excel::download($export, '特种设备导入模板.xlsx');
    }

    /**
     * 批量导入
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'company_id' => 'required|integer',
        ]);

        Excel::import(new SpecialEquipmentImport(
            companyId: (int) $request->company_id,
            userId: auth()->id() ?? 0,
        ), $request->file('file'));

        return $this->message('导入成功');
    }

    /**
     * 导出列表
     */
    public function export(Request $request): BinaryFileResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return Excel::download(new SpecialEquipmentExport(
            companyId: (int) $request->company_id,
            equipmentName: $request->get('equipment_name') ?: null,
            specialTypeId: $request->filled('special_type_id') ? (int) $request->special_type_id : null,
        ), '特种设备列表.xlsx');
    }

    /**
     * 复制记录
     */
    public function copy(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $originals = SpecialEquipment::whereIn('id', $request->ids)->get();

        if ($originals->isEmpty()) {
            return $this->notFound('未找到指定记录');
        }

        $newIds = [];
        foreach ($originals as $original) {
            $data = $original->only([
                'equipment_name', 'special_type_id', 'utilized_location',
                'norm_model1', 'norm_model2', 'norm_model3', 'norm_model4',
                'use_time', 'valid_period', 'inspect_unit', 'maintain_info',
                'comment', 'company_id',
            ]);
            $data['serial_number'] = null;
            $data['user_id'] = auth()->id() ?? 0;
            $data['last_user_id'] = auth()->id() ?? 0;

            $newIds[] = SpecialEquipment::create($data)->id;
        }

        return $this->success(['ids' => $newIds, 'count' => count($newIds)]);
    }
}
