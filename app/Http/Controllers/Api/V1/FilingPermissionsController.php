<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\FilingPermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilingPermissionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = FilingPermission::query()
            ->where('company_id', $request->company_id)
            ->with('recordType')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = FilingPermission::query()->with('recordType')->find($id);

        if (!$data) {
            return $this->notFound('备案/许可信息不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'record_type_id' => 'required|integer',
        ]);

        $data = $request->only(
            'record_type_id', 'issuing_department', 'filing_range',
            'filing_time', 'valid_period', 'comment', 'annex_url', 'company_id'
        );
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $filingPermission = FilingPermission::create($data);

        return $this->success($filingPermission);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $filingPermission = FilingPermission::find($id);

        if (!$filingPermission) {
            return $this->notFound('备案/许可信息不存在');
        }

        $filingPermission->update(array_merge(
            $request->only(
                'record_type_id', 'issuing_department', 'filing_range',
                'filing_time', 'valid_period', 'comment', 'annex_url', 'company_id'
            ),
            ['last_user_id' => auth()->id() ?? 0]
        ));

        return $this->success($filingPermission);
    }

    public function destroy(int $id): JsonResponse
    {
        $filingPermission = FilingPermission::find($id);

        if (!$filingPermission) {
            return $this->notFound('备案/许可信息不存在');
        }

        $filingPermission->delete();

        return $this->message('删除成功', 204);
    }
}
