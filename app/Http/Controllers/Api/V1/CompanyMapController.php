<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyMapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $underlingId = $this->childId((int) ($request->user()?->company_id ?? 0));

        $companies = Company::query()
            ->whereIn('id', $underlingId)
            ->where('status', 1)
            ->when($request->title, function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->title . '%');
            })
            ->when($request->inherent_risk_grade, function ($query) use ($request) {
                $query->where('inherent_risk_grade', 'like', '%' . $request->inherent_risk_grade . '%');
            })
            ->when($request->float_risk_grade, function ($query) use ($request) {
                $query->where('float_risk_grade', 'like', '%' . $request->float_risk_grade . '%');
            })
            ->paginate($request->get('per_page', 100));

        return $this->success($companies);
    }
}
