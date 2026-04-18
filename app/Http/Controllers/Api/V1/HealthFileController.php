<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\HealthFileExport;
use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreHealthFileRequest;
use App\Http\Requests\Api\V1\UpdateHealthFileRequest;
use App\Imports\HealthFileImport;
use App\Models\HealthFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class HealthFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthFile::query();

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
        $data = HealthFile::find($id);

        if (! $data) {
            return $this->notFound('健康档案不存在');
        }

        return $this->success($data);
    }

    public function store(StoreHealthFileRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $healthFile = HealthFile::create($data);

        return $this->success($healthFile);
    }

    public function update(UpdateHealthFileRequest $request, int $id): JsonResponse
    {
        $healthFile = HealthFile::find($id);

        if (! $healthFile) {
            return $this->notFound('健康档案不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $healthFile->update($data);

        return $this->success($healthFile->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $healthFile = HealthFile::find($id);

        if (! $healthFile) {
            return $this->notFound('健康档案不存在');
        }

        $healthFile->delete();

        return $this->message('删除成功');
    }

    public function template(): BinaryFileResponse
    {
        $export = new StaffTemplateExport(
            headings: ['姓名*', '工号', '部门', '岗位', '体检日期(YYYY-MM-DD)', '体检结论', '复查情况', '处理意见', '处理结果'],
            examples: [['张三', 'EMP001', '生产部', '操作员', '2024-03-01', '合格', '', '', '']],
        );

        return Excel::download($export, '职业健康档案导入模板.xlsx');
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'company_id' => 'required|integer',
        ]);

        $importer = new HealthFileImport(
            companyId: (int) $request->company_id,
            userId: auth()->id() ?? 0,
        );

        Excel::import($importer, $request->file('file'));

        $errors = $importer->getErrors();
        if ($errors) {
            return $this->setStatusCode(422)->status('error', [
                'message' => '部分行导入失败',
                'data' => ['row_errors' => $errors],
            ]);
        }

        return $this->message('导入成功');
    }

    public function export(Request $request): BinaryFileResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return Excel::download(new HealthFileExport(
            companyId: (int) $request->company_id,
            name: $request->get('name') ?: null,
        ), '职业健康档案列表.xlsx');
    }
}
