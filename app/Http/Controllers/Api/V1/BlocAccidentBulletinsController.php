<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocAccidentBulletinsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Placeholder: aggregate accident bulletins across company tree
        return $this->success([]);
    }
}
