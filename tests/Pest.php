<?php

use App\Models\Company;
use App\Models\User;
use App\Services\RsaService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        // 创建 Passport personal access client
        $this->artisan('passport:client', [
            '--personal' => true,
            '--name' => 'Test',
            '--provider' => 'users',
        ]);

        // 初始化角色和权限
        $this->seed(RolesAndPermissionsSeeder::class);

        // Bypass RSA decryption in tests — the real service expects base64-RSA
        // ciphertext from the browser. Tests post plain passwords, so we swap in
        // a passthrough decryptor.
        $this->app->instance(RsaService::class, new class extends RsaService
        {
            public function __construct() {}

            public function decrypt(string $ciphertext): string
            {
                return $ciphertext;
            }

            public function publicKey(): string
            {
                return '';
            }
        });
    })
    ->in('Feature');

// ── 测试辅助函数 ──────────────────────────────────────────

function createUserWithCompany(): array
{
    $company = Company::factory()->create();
    $user = User::factory()->create(['company_id' => $company->id]);
    $user->assignRole('user');

    return [$user, $company];
}

function createAdminWithCompany(): array
{
    $company = Company::factory()->create();
    $user = User::factory()->create(['company_id' => $company->id]);
    $user->assignRole('admin');

    return [$user, $company];
}

function createSuperAdminWithCompany(): array
{
    $company = Company::factory()->create();
    $user = User::factory()->create(['company_id' => $company->id]);
    $user->assignRole('super-admin');

    return [$user, $company];
}

function createReviewerWithCompany(): array
{
    $company = Company::factory()->create();
    $user = User::factory()->create(['company_id' => $company->id]);
    $user->assignRole('reviewer');

    return [$user, $company];
}
