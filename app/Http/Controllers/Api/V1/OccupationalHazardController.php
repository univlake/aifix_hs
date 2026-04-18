<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\OccupationalHazardExport;
use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreOccupationalHazardRequest;
use App\Http\Requests\Api\V1\UpdateOccupationalHazardRequest;
use App\Imports\OccupationalHazardImport;
use App\Models\OccupationalHazard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OccupationalHazardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OccupationalHazard::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        if ($request->filled('is_declare')) {
            $query->where('is_declare', $request->is_declare);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = OccupationalHazard::find($id);

        if (! $data) {
            return $this->notFound('职业危害清单不存在');
        }

        return $this->success($data);
    }

    public function store(StoreOccupationalHazardRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $occupationalHazard = OccupationalHazard::create($data);

        return $this->success($occupationalHazard);
    }

    public function update(UpdateOccupationalHazardRequest $request, int $id): JsonResponse
    {
        $occupationalHazard = OccupationalHazard::find($id);

        if (! $occupationalHazard) {
            return $this->notFound('职业危害清单不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $occupationalHazard->update($data);

        return $this->success($occupationalHazard->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $occupationalHazard = OccupationalHazard::find($id);

        if (! $occupationalHazard) {
            return $this->notFound('职业危害清单不存在');
        }

        $occupationalHazard->delete();

        return $this->message('删除成功');
    }

    public function template(): BinaryFileResponse
    {
        $export = new StaffTemplateExport(
            headings: ['作业场所*', '职业危害因素(粉尘类/放射性物质类/化学物质类/噪音/其他)', '接触人数', '申报状态(已申报/未申报)', '申报日期(YYYY-MM-DD)'],
            examples: [['配料车间', '粉尘类', 10, '已申报', '2024-01-15']],
        );

        return Excel::download($export, '职业病危害因素导入模板.xlsx');
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'company_id' => 'required|integer',
        ]);

        $importer = new OccupationalHazardImport(
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

        return Excel::download(new OccupationalHazardExport(
            companyId: (int) $request->company_id,
            name: $request->get('name') ?: null,
        ), '职业病危害因素列表.xlsx');
    }
}
