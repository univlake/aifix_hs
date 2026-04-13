<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * 所有权限列表（按模块分组）
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::where('guard_name', 'api')
            ->orderBy('name')
            ->get();

        // 按模块分组
        $grouped = [];
        foreach ($permissions as $permission) {
            $parts = explode('.', $permission->name);
            $module = $parts[0] ?? 'other';
            $grouped[$module][] = $permission;
        }

        return $this->success([
            'list' => $permissions,
            'grouped' => $grouped,
        ]);
    }
}
