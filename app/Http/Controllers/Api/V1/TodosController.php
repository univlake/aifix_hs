<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodosController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'type' => 'required|string',
        ]);

        // Placeholder: return empty array for now
        return $this->success([]);
    }

    public function listTable(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
        ]);

        return $this->success([]);
    }
}
