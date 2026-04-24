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

        it('updates profile nickname/phone/email', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'nickname' => '新昵称',
                    'phone' => '13900000001',
                    'email' => 'new@example.com',
                ]);

            $response->assertOk();

            $user->refresh();
            expect($user->nickname)->toBe('新昵称');
            expect($user->phone)->toBe('13900000001');
            expect($user->email)->toBe('new@example.com');
        });

        it('rejects profile update with missing nickname', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'phone' => '13900000002',
                ]);

            $response->assertStatus(422);
        });

        it('rejects profile update with phone already taken', function () {
            [$user] = createUserWithCompany();
            User::factory()->create(['phone' => '13900000003']);

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'nickname' => 'x',
                    'phone' => '13900000003',
                ]);

            $response->assertStatus(422);
        });

        it('allows profile update keeping own phone', function () {
            [$user] = createUserWithCompany();
            $user->update(['phone' => '13900000004']);

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'nickname' => '保留自己手机号',
                    'phone' => '13900000004',
                ]);

            $response->assertOk();
        });

        it('rejects profile update for unauthenticated user', function () {
            $response = $this->putJson('/api/v1/user-info', [
                'nickname' => 'x',
            ]);

            $response->assertStatus(401);
        });

        it('returns must_change_credentials flag in user info', function () {
            [$user] = createUserWithCompany();
            $user->update(['must_change_credentials' => true]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/user-info');

            $response->assertOk()
                ->assertJsonPath('data.must_change_credentials', true);
        });

        it('updates own username via profile endpoint', function () {
            [$user] = createUserWithCompany();
            $user->update(['username' => 'oldname']);

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'nickname' => $user->nickname,
                    'username' => 'newname',
                ]);

            $response->assertOk();
            expect($user->fresh()->username)->toBe('newname');
        });

        it('rejects username update when taken by another user', function () {
            [$user] = createUserWithCompany();
            User::factory()->create(['username' => 'taken']);

            $response = $this->actingAs($user, 'api')
                ->putJson('/api/v1/user-info', [
                    'nickname' => $user->nickname,
                    'username' => 'taken',
                ]);

            $response->assertStatus(422);
        });
    });

    describe('Username availability', function () {
        it('reports available for own username', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/username-availability?username='.$user->username);

            $response->assertOk()
                ->assertJsonPath('data.available', true);
        });

        it('reports unavailable for username taken by someone else', function () {
            [$user] = createUserWithCompany();
            User::factory()->create(['username' => 'somebody']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/username-availability?username=somebody');

            $response->assertOk()
                ->assertJsonPath('data.available', false);
        });

        it('rejects invalid format', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/username-availability?username=_bad.');

            $response->assertOk()
                ->assertJsonPath('data.available', false);
        });

        it('rejects reserved c{id}_admin pattern', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/username-availability?username=c99_admin');

            $response->assertOk()
                ->assertJsonPath('data.available', false);
        });

        it('rejects too-short username', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/username-availability?username=ab');

            $response->assertOk()
                ->assertJsonPath('data.available', false);
        });
    });

    describe('First login setup', function () {
        it('succeeds and clears the flag', function () {
            [$user] = createUserWithCompany();
            $user->update([
                'username' => 'c5_admin',
                'password' => Hash::make('tempPassword'),
                'must_change_credentials' => true,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'chosenname',
                    'new_password' => 'newstrongpass',
                    'new_password_confirmation' => 'newstrongpass',
                ]);

            $response->assertOk();

            $user->refresh();
            expect($user->username)->toBe('chosenname');
            expect(Hash::check('newstrongpass', $user->password))->toBeTrue();
            expect((bool) $user->must_change_credentials)->toBeFalse();
        });

        it('rejects when flag is not set', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'somename',
                    'new_password' => 'newstrongpass',
                    'new_password_confirmation' => 'newstrongpass',
                ]);

            $response->assertStatus(403);
        });

        it('rejects when new username equals current', function () {
            [$user] = createUserWithCompany();
            $user->update([
                'username' => 'c5_admin',
                'must_change_credentials' => true,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'c5_admin',
                    'new_password' => 'newstrongpass',
                    'new_password_confirmation' => 'newstrongpass',
                ]);

            $response->assertStatus(422);
        });

        it('rejects when new password equals current', function () {
            [$user] = createUserWithCompany();
            $user->update([
                'username' => 'c5_admin',
                'password' => Hash::make('reusedpass'),
                'must_change_credentials' => true,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'chosenname',
                    'new_password' => 'reusedpass',
                    'new_password_confirmation' => 'reusedpass',
                ]);

            $response->assertStatus(422);
        });

        it('rejects when new username is taken', function () {
            [$user] = createUserWithCompany();
            $user->update([
                'username' => 'c5_admin',
                'must_change_credentials' => true,
            ]);
            User::factory()->create(['username' => 'taken']);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'taken',
                    'new_password' => 'newstrongpass',
                    'new_password_confirmation' => 'newstrongpass',
                ]);

            $response->assertStatus(422);
        });

        it('rejects mismatched password confirmation', function () {
            [$user] = createUserWithCompany();
            $user->update([
                'username' => 'c5_admin',
                'must_change_credentials' => true,
            ]);

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/first-login-setup', [
                    'new_username' => 'chosenname',
                    'new_password' => 'newstrongpass',
                    'new_password_confirmation' => 'different',
                ]);

            $response->assertStatus(422);
        });
    });
});
