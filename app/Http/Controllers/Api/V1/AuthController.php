<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserType;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * 登录
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->failed('用户名或密码错误', 401);
        }

        if ($user->status !== UserType::Enable->value) {
            return $this->failed('该账号已被禁用', 403);
        }

        $tokenResult = $user->createToken('admin');
        $token = $tokenResult->accessToken;

        // 更新登录次数
        $user->increment('login_times');

        return $this->success([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenResult->token->expires_at->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * 注册
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|max:30|unique:users,username',
            'password' => 'required|string|min:6|confirmed',
            'nickname' => 'required|string|max:100',
            'company_id' => 'required|integer',
            'phone' => 'nullable|string|max:255|unique:users,phone',
            'email' => 'nullable|email|max:255|unique:users,email',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'nickname' => $request->nickname,
            'company_id' => $request->company_id,
            'phone' => $request->phone,
            'email' => $request->email,
            'status' => UserType::Enable->value,
        ]);

        // 默认分配普通用户角色
        $user->assignRole('user');

        $tokenResult = $user->createToken('admin');

        return $this->success([
            'user' => $user,
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * 登出
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->token()?->revoke();

        return $this->message('退出成功');
    }

    /**
     * 获取用户信息
     */
    public function userInfo(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['company', 'roles.permissions']);

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'nickname' => $user->nickname,
            'company_id' => $user->company_id,
            'company' => $user->company,
            'phone' => $user->phone,
            'email' => $user->email,
            'status' => $user->status,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * 修改密码
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return $this->failed('原密码错误');
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return $this->message('密码修改成功');
    }
}
