<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSpecialEquipmentStaffRequest;
use App\Http\Requests\Api\V1\UpdateSpecialEquipmentStaffRequest;
use App\Imports\StaffImport;
use App\Models\SpecialEquipmentStaff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SpecialEquipmentStaffController extends Controller
{
    /**
     * 下载导入模板
     */
    public function template(): BinaryFileResponse
    {
        $export = new StaffTemplateExport(
            headings: ['姓名*', '证书名称', '证书编号', '有效期(YYYY-MM-DD)'],
            examples: [['张三', '特种作业操作证', 'TZ2024001', '2030-12-31']],
        );

        return Excel::download($export, '特种作业人员导入模板.xlsx');
    }

    /**
     * 导入特种作业人员
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'company_id' => 'required|integer',
        ]);

        Excel::import(new StaffImport(
            modelClass: SpecialEquipmentStaff::class,
            companyId: (int) $request->company_id,
            columnMap: [0 => 'name', 1 => 'cert_title', 2 => 'cert_number', 3 => 'valid_period'],
            userId: auth()->id() ?? 0,
        ), $request->file('file'));

        return $this->message('导入成功');
    }

    public function index(Request $request): JsonResponse
    {
        $query = SpecialEquipmentStaff::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SpecialEquipmentStaff::find($id);

        if (! $data) {
            return $this->notFound('特种设备人员不存在');
        }

        return $this->success($data);
    }

    public function store(StoreSpecialEquipmentStaffRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $specialEquipmentStaff = SpecialEquipmentStaff::create($data);

        return $this->success($specialEquipmentStaff);
    }

    public function update(UpdateSpecialEquipmentStaffRequest $request, int $id): JsonResponse
    {
        $specialEquipmentStaff = SpecialEquipmentStaff::find($id);

        if (! $specialEquipmentStaff) {
            return $this->notFound('特种设备人员不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $specialEquipmentStaff->update($data);

        return $this->success($specialEquipmentStaff->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $specialEquipmentStaff = SpecialEquipmentStaff::find($id);

        if (! $specialEquipmentStaff) {
            return $this->notFound('特种设备人员不存在');
        }

        $specialEquipmentStaff->delete();

        return $this->message('删除成功');
    }
}
