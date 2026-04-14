<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomesController extends Controller
{
    public function earlyWarning(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        // Placeholder: return empty array
        return $this->success([]);
    }

    public function companyInfo(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $company = Company::find($request->company_id);
        $data = [
            'pid_company_name' => $company?->title ?? '',
            'child_company_number' => 0,
            'total_people' => 0,
        ];

        return $this->success($data);
    }
}
