<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocNoticesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Placeholder: aggregate notice data across company tree
        return $this->success([]);
    }
}
