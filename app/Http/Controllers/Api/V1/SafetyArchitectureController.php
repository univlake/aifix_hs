<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SafetyArchitecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyArchitectureController extends Controller
{
    /**
     * 安全架构（只返回第一条）
     */
    public function index(Request $request): JsonResponse
    {
        $record = SafetyArchitecture::query()
            ->where('company_id', $request->get('company_id'))
            ->first();

        return $this->success($record);
    }

    /**
     * 创建安全架构
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer|unique:safety_architectures',
            'thumbnail_url' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = SafetyArchitecture::create($data);

        return $this->success($record);
    }

    /**
     * 更新安全架构
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = SafetyArchitecture::find($id);

        if (!$record) {
            return $this->notFound('安全架构不存在');
        }

        $data = $request->validate([
            'thumbnail_url' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }
}
