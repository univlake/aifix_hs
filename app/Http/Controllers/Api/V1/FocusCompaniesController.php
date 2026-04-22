<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreFocusCompaniesRequest;
use App\Models\FocusCompany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FocusCompaniesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FocusCompany::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('focus_id')) {
            $query->where('focus_id', $request->focus_id);
        }

        $list = $query->with(['company:id,title,inherent_risk,inherent_risk_grade,float_risk,float_risk_grade'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function store(StoreFocusCompaniesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FocusCompany::create($data);

        return $this->success($record);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FocusCompany::find($id);

        if (! $record) {
            return $this->notFound('关注企业不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
