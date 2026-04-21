<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * 认证用户所在企业 id；未绑定企业时为 null.
     */
    protected function currentCompanyId(): ?int
    {
        $cid = auth()->user()?->company_id;

        return $cid ? (int) $cid : null;
    }

    /**
     * 在当前企业范围内查找目标用户，跨企业视为不存在。
     */
    protected function findInOwnCompany(int $id): ?User
    {
        $cid = $this->currentCompanyId();

        if (! $cid) {
            return null;
        }

        return User::with(['roles.permissions', 'company:id,title'])
            ->where('company_id', $cid)
            ->find($id);
    }

    /**
     * 用户列表
     */
    public function index(Request $request): JsonResponse
    {
        $cid = $this->currentCompanyId();
        $query = User::with('roles')->where('company_id', $cid ?? 0);

        if ($request->filled('username')) {
            $query->where('username', 'like', '%'.$request->username.'%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 按角色筛选
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list->through(fn (User $user) => (new UserResource($user))->resolve(request())));
    }

    /**
     * 用户详情
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->findInOwnCompany($id);

        if (! $user) {
            return $this->notFound('用户不存在');
        }

        return $this->success(new UserResource($user));
    }

    /**
     * 创建用户
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $cid = $this->currentCompanyId();

        if (! $cid) {
            return $this->failed('当前账号未绑定企业，无法创建用户', 403);
        }

        $data = $request->validated();
        $user = User::create([
            'username' => $data['username'],
            'password' => Hash::make($data['password']),
            'nickname' => $data['nickname'],
            'company_id' => $cid,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'status' => 1,
        ]);

        // 分配角色
        $roleName = $data['role'] ?? 'user';
        $user->assignRole($roleName);

        return $this->success(new UserResource($user->load('roles')));
    }

    /**
     * 更新用户
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->findInOwnCompany($id);

        if (! $user) {
            return $this->notFound('用户不存在');
        }

        $data = $request->validated();
        // 不允许跨企业转移
        unset($data['company_id']);
        $user->update($data);

        return $this->success(new UserResource($user->fresh(['roles'])));
    }

    /**
     * 分配角色
     */
    public function assignRole(Request $request, int $id): JsonResponse
    {
        $user = $this->findInOwnCompany($id);

        if (! $user) {
            return $this->notFound('用户不存在');
        }

        $data = $request->validate(['role' => 'required|string|exists:roles,name']);
        $user->syncRoles([$data['role']]);

        return $this->success(new UserResource($user->load('roles')));
    }

    /**
     * 重置密码（管理员用）
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = $this->findInOwnCompany($id);

        if (! $user) {
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
