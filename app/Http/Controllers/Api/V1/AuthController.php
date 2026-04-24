<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CompanyStatus;
use App\Enums\UserType;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Models\User;
use App\Services\RsaService;
use App\Services\UsernameValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
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

        if ($user->company_id && ! $user->hasRole('super-admin', 'api')) {
            $company = $user->company;
            if ($company && $company->status !== CompanyStatus::Enable->value) {
                return $this->failed('该企业已被停用，请联系管理员', 403);
            }
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
            'must_change_credentials' => (bool) $user->must_change_credentials,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    /**
     * 更新当前用户的个人资料（支持修改用户名）
     */
    public function updateUserInfo(Request $request): JsonResponse
    {
        $user = $request->user();

        $rules = [
            'nickname' => 'required|string|max:100',
            'phone' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'phone')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'header_img' => 'nullable|string',
        ];

        if ($request->has('username')) {
            $rules['username'] = 'required|string';
        }

        $validated = $request->validate($rules, [
            'nickname.required' => '昵称不能为空',
            'nickname.max' => '昵称不能超过100个字符',
            'phone.unique' => '该手机号已被使用',
            'email.email' => '邮箱格式不正确',
            'email.unique' => '该邮箱已被使用',
            'username.required' => '用户名不能为空',
        ]);

        if (array_key_exists('username', $validated) && $validated['username'] !== $user->username) {
            $check = UsernameValidator::check($validated['username'], $user->id);
            if (! $check['available']) {
                return $this->failed($check['reason'] ?? '用户名不可用', 422);
            }
        }

        $user->update($validated);

        return $this->message('个人资料更新成功');
    }

    /**
     * 检查用户名是否可用（实时校验）
     */
    public function checkUsernameAvailability(Request $request): JsonResponse
    {
        $username = $request->query('username');
        $user = $request->user();

        $result = UsernameValidator::check(
            is_string($username) ? $username : null,
            $user?->id,
        );

        return $this->success($result);
    }

    /**
     * 首次登录修改用户名和密码
     *
     * 仅当 must_change_credentials=1 时允许调用；成功后清除该标志。
     * 两个字段都必须修改，且不能与当前值相同。
     */
    public function firstLoginSetup(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->must_change_credentials) {
            return $this->failed('无需首次登录设置', 403);
        }

        $validated = $request->validate([
            'new_username' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'new_username.required' => '新用户名不能为空',
            'new_password.required' => '新密码不能为空',
            'new_password.min' => '新密码至少 6 位',
            'new_password.confirmed' => '两次输入的新密码不一致',
        ]);

        if ($validated['new_username'] === $user->username) {
            return $this->failed('新用户名不能与当前用户名相同', 422);
        }

        if (Hash::check($validated['new_password'], $user->password)) {
            return $this->failed('新密码不能与当前密码相同', 422);
        }

        $check = UsernameValidator::check($validated['new_username'], $user->id);
        if (! $check['available']) {
            return $this->failed($check['reason'] ?? '用户名不可用', 422);
        }

        $user->update([
            'username' => $validated['new_username'],
            'password' => Hash::make($validated['new_password']),
            'must_change_credentials' => false,
        ]);

        return $this->message('设置成功，请重新登录');
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
