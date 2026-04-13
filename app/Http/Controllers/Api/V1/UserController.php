<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * 用户列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->filled('username')) {
            $query->where('username', 'like', '%' . $request->username . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // 按角色筛选
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 用户详情
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with(['roles.permissions', 'company:id,title'])->find($id);

        if (!$user) {
            return $this->notFound('用户不存在');
        }

        return $this->success($user);
    }

    /**
     * 创建用户
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|max:30|unique:users,username',
            'password' => 'required|string|min:6',
            'nickname' => 'required|string|max:100',
            'company_id' => 'required|integer',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'role' => 'nullable|string|exists:roles,name',
        ]);

        $user = User::create([
            'username' => $data['username'],
            'password' => Hash::make($data['password']),
            'nickname' => $data['nickname'],
            'company_id' => $data['company_id'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'status' => 1,
        ]);

        // 分配角色
        $roleName = $data['role'] ?? 'user';
        $user->assignRole($roleName);

        return $this->success($user->load('roles'));
    }

    /**
     * 更新用户
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFound('用户不存在');
        }

        $data = $request->validate([
            'nickname' => 'sometimes|required|string|max:100',
            'company_id' => 'sometimes|required|integer',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'status' => 'nullable|integer|in:1,2',
        ]);

        $user->update($data);

        return $this->success($user->fresh()->load('roles'));
    }

    /**
     * 分配角色
     */
    public function assignRole(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFound('用户不存在');
        }

        $data = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $user->syncRoles([$data['role']]);

        return $this->success($user->load('roles'));
    }

    /**
     * 重置密码（管理员用）
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->notFound('用户不存在');
        }

        $data = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        return $this->message('密码重置成功');
    }
}
