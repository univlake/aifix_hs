<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnterpriseReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Placeholder: enterprise report aggregation
        return $this->success([]);
    }
}
