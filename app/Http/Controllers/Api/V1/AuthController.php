<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserType;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Models\User;
use App\Services\RsaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AuthController extends Controller
{
    public function __construct(private readonly RsaService $rsa) {}

    /**
     * 返回 RSA 公钥，供前端加密密码使用
     */
    public function publicKey(): JsonResponse
    {
        return $this->success(['public_key' => $this->rsa->publicKey()]);
    }

    /**
     * 登录
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $plainPassword = $this->rsa->decrypt($request->password);
        } catch (RuntimeException $e) {
            return $this->failed($e->getMessage(), 422);
        }

        $user = User::query()->where('username', $request->username)->first();

        if (! $user || ! Hash::check($plainPassword, $user->password)) {
            return $this->failed('用户名或密码错误', 401);
        }

        if ($user->status !== UserType::Enable->value) {
            return $this->failed('该账号已被禁用', 403);
        }

        $tokenResult = $user->createToken('admin');
        $token = $tokenResult->accessToken;

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
            'password' => 'required|string',
            'password_confirmation' => 'required|string',
            'nickname' => 'required|string|max:100',
            'company_id' => 'required|integer',
            'phone' => 'nullable|string|max:255|unique:users,phone',
            'email' => 'nullable|email|max:255|unique:users,email',
        ]);

        try {
            $plainPassword = $this->rsa->decrypt($request->password);
            $plainPasswordConfirmation = $this->rsa->decrypt($request->password_confirmation);
        } catch (RuntimeException $e) {
            return $this->failed($e->getMessage(), 422);
        }

        if ($plainPassword !== $plainPasswordConfirmation) {
            return $this->failed('两次密码输入不一致', 422);
        }

        if (mb_strlen($plainPassword) < 6) {
            return $this->failed('密码至少 6 位', 422);
        }

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($plainPassword),
            'nickname' => $request->nickname,
            'company_id' => $request->company_id,
            'phone' => $request->phone,
            'email' => $request->email,
            'status' => UserType::Enable->value,
        ]);

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

        if (! Hash::check($request->old_password, $user->password)) {
            return $this->failed('原密码错误');
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return $this->message('密码修改成功');
    }
}
