<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\DangerousEquipmentExport;
use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreDangerousEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateDangerousEquipmentRequest;
use App\Imports\DangerousEquipmentImport;
use App\Models\DangerousEquipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DangerousEquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DangerousEquipment::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%'.$request->equipment_name.'%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = DangerousEquipment::find($id);

        if (! $data) {
            return $this->notFound('主要危险设备不存在');
        }

        return $this->success($data);
    }

    public function store(StoreDangerousEquipmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = DangerousEquipment::create($data);

        return $this->success($record);
    }

    public function update(UpdateDangerousEquipmentRequest $request, int $id): JsonResponse
    {
        $record = DangerousEquipment::find($id);

        if (! $record) {
            return $this->notFound('主要危险设备不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = DangerousEquipment::find($id);

        if (! $record) {
            return $this->notFound('主要危险设备不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    /**
     * 下载导入模板
     */
    public function template(): BinaryFileResponse
    {
        $export = new StaffTemplateExport(
            headings: [
                '设备名称*', '使用位置', '规格型号', '使用证编号',
                '投用时间(YYYY-MM-DD)', '自动化程度', '维护信息', '备注',
            ],
            examples: [[
                '高压反应釜', '生产车间B', 'HY-2000', 'SZ2024001',
                '2021-06-01', '全自动设备', '', '',
            ]],
        );

        return Excel::download($export, '主要危险设备导入模板.xlsx');
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

        Excel::import(new DangerousEquipmentImport(
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

        return Excel::download(new DangerousEquipmentExport(
            companyId: (int) $request->company_id,
            equipmentName: $request->get('equipment_name') ?: null,
        ), '主要危险设备列表.xlsx');
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

        $originals = DangerousEquipment::whereIn('id', $request->ids)->get();

        if ($originals->isEmpty()) {
            return $this->notFound('未找到指定记录');
        }

        $newIds = [];
        foreach ($originals as $original) {
            $data = $original->only([
                'equipment_name', 'utilized_location', 'norm_model',
                'use_time', 'automation_type', 'maintain_info', 'comment', 'company_id',
            ]);
            $data['serial_number'] = null;
            $data['user_id'] = auth()->id() ?? 0;
            $data['last_user_id'] = auth()->id() ?? 0;

            $newIds[] = DangerousEquipment::create($data)->id;
        }

        return $this->success(['ids' => $newIds, 'count' => count($newIds)]);
    }
}
