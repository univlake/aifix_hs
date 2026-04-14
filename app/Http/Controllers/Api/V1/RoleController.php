<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Requests\Api\V1\StoreRoleRequest;
use App\Http\Requests\Api\V1\UpdateRoleRequest;

class RoleController extends Controller
{
    /**
     * 角色列表（含权限）
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')
            ->where('guard_name', 'api')
            ->get();

        return $this->success($roles);
    }

    /**
     * 角色详情
     */
    public function show(int $id): JsonResponse
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return $this->notFound('角色不存在');
        }

        return $this->success($role);
    }

    /**
     * 创建角色
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'api',
        ]);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $this->success($role->load('permissions'));
    }

    /**
     * 更新角色
     */
    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return $this->notFound('角色不存在');
        }

        // 禁止修改超级管理员
        if ($role->name === 'super-admin') {
            return $this->failed('禁止修改超级管理员角色');
        }
        $data = $request->validated();
        if (isset($data['name'])) {
            $role->update(['name' => $data['name']]);
        }

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $this->success($role->load('permissions'));
    }

    /**
     * 删除角色
     */
    public function destroy(int $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return $this->notFound('角色不存在');
        }

        if (in_array($role->name, ['super-admin', 'admin', 'user'])) {
            return $this->failed('系统内置角色不可删除');
        }

        if ($role->users()->count() > 0) {
            return $this->failed('该角色下仍有用户，请先移除用户');
        }

        $role->delete();

        return $this->message('删除成功');
    }
}
