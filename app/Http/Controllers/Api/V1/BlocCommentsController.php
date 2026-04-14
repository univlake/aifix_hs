<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentBulletin;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocCommentsController extends Controller
{
    public function getInfo(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'type' => 'required|string',
        ]);

        // Calculate safe production days since last fatal accident
        $oldTime = AccidentBulletin::query()
            ->where('company_id', $request->company_id)
            ->where('staff_die', '>', 0)
            ->orderByDesc('created_at')
            ->value('created_at') ?? '2023-01-01';

        $days = (int) ceil((time() - strtotime($oldTime)) / 86400);
        $day1 = 24 - (int) date('d');

        if ($day1 >= 0) {
            $data = "自系统运行，已安全生产{$days}天；距离下次月报提交还有{$day1}天；";
        } else {
            $data = "自系统运行，已安全生产{$days}天；";
        }

        return $this->success($data);
    }
}
