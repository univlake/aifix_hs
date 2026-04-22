<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

// /api/v1/login is rate-limited to 5 requests / minute / IP. Since tests share
// the 127.0.0.1 loopback IP, the limiter accumulates hits across tests and the
// 6th+ request returns 429 (which surfaces as auth failure). Reset between tests.
beforeEach(function () {
    RateLimiter::clear('login:127.0.0.1');
    RateLimiter::clear('login:'.request()->ip());
});

describe('Auth API', function () {
    describe('Login', function () {
        it('returns token on valid credentials', function () {
            $company = Company::factory()->create();
            $user = User::factory()->create([
                'username' => 'testuser',
                'password' => Hash::make('password123'),
                'company_id' => $company->id,
                'status' => 1,
            ]);

            $response = $this->postJson('/api/v1/login', [
                'username' => 'testuser',
                'password' => 'password123',
            ]);

            $response->assertOk()
                ->assertJsonStructure([
                    'status',
                    'code',
                    'data' => ['access_token', 'token_type', 'expires_at'],
                ]);
        });

        it('returns 401 on wrong password', function () {
            Company::factory()->create();
            User::factory()->create([
                'username' => 'testuser',
                'password' => Hash::make('password123'),
                'status' => 1,
            ]);

            $response = $this->postJson('/api/v1/login', [
                'username' => 'testuser',
                'password' => 'wrongpassword',
            ]);

            $response->assertStatus(401);
        });

        it('returns 401 on non-existent user', function () {
            $response = $this->postJson('/api/v1/login', [
                'username' => 'nonexistent',
                'password' => 'password',
            ]);

            $response->assertStatus(401);
        });

        it('returns 403 when user is disabled', function () {
            Company::factory()->create();
            User::factory()->create([
                'username' => 'disableduser',
                'password' => Hash::make('password123'),
                'status' => 2,
            ]);

            $response = $this->postJson('/api/v1/login', [
                'username' => 'disableduser',
                'password' => 'password123',
            ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            $response = $this->postJson('/api/v1/login', []);

            $response->assertStatus(422);
        });
    });

    describe('Register', function () {
        it('creates user and returns token', function () {
            $company = Company::factory()->create();

            $response = $this->postJson('/api/v1/register', [
                'username' => 'newuser',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'nickname' => 'New User',
                'company_id' => $company->id,
            ]);

            $response->assertOk()
                ->assertJsonStructure([
                    'status',
                    'code',
                    'data' => ['user', 'access_token', 'token_type'],
                ]);

            $this->assertDatabaseHas('users', ['username' => 'newuser']);

            // 验证默认分配了 user 角色
            $createdUser = User::where('username', 'newuser')->first();
            expect($createdUser->hasRole('user'))->toBeTrue();
        });

        it('validates duplicate username', function () {
            User::factory()->create(['username' => 'existinguser']);

            $response = $this->postJson('/api/v1/register', [
                'username' => 'existinguser',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'nickname' => 'Test',
                'company_id' => 1,
            ]);

            $response->assertStatus(422);
        });
    });

    describe('Protected routes', function () {
        it('rejects unauthenticated requests', function () {
            $response = $this->getJson('/api/v1/user-info');

            $response->assertStatus(401);
        });

        it('returns user info with roles and permissions', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/user-info');

            $response->assertOk()
                ->assertJsonPath('data.username', $user->username)
                ->assertJsonStructure([
                    'data' => ['id', 'username', 'nickname', 'roles', 'permissions'],
                ]);

            // 验证包含 admin 角色
            $responseData = $response->json('data');
            expect($responseData['roles'])->toContain('admin');
            expect($responseData['permissions'])->toContain('companies.list');
        });

        it('logs out and revokes token', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/logout');

            $response->assertOk();
        });

        it('resets password with correct old password', function () {
            [$user] = createUserWithCompany();
            $user->update(['password' => Hash::make('oldpassword')]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/reset-password', [
                    'old_password' => 'oldpassword',
                    'new_password' => 'newpassword123',
                    'new_password_confirmation' => 'newpassword123',
                ]);

            $response->assertOk();
        });

        it('rejects reset with wrong old password', function () {
            [$user] = createUserWithCompany();
            $user->update(['password' => Hash::make('oldpassword')]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/reset-password', [
                    'old_password' => 'wrongpassword',
                    'new_password' => 'newpassword123',
                    'new_password_confirmation' => 'newpassword123',
                ]);

            $response->assertStatus(400);
        });
    });
});
