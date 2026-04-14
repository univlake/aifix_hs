<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnlineInspectionController extends Controller
{
    public function personnelCertificate(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function personnelCertificateExpand(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function equipment(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function equipmentExpand(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function monthlyInvestigation(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function monthlyInvestigationExpand(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }

    public function productionStandardization(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        return $this->success([]);
    }
}
