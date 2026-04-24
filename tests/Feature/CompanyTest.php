<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

describe('Company API', function () {
    describe('Index (List)', function () {
        it('returns paginated company list', function () {
            [$user] = createUserWithCompany();
            Company::factory()->count(3)->create();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies');

            $response->assertOk()
                ->assertJsonCount(4, 'data.data');
        });

        it('filters by title', function () {
            [$user] = createUserWithCompany();
            Company::factory()->create(['title' => '测试企业A']);
            Company::factory()->create(['title' => '测试企业B']);
            Company::factory()->create(['title' => '其他公司']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies?title='.urlencode('测试企业'));

            $response->assertOk()
                ->assertJsonCount(2, 'data.data');
        });

        it('filters by status', function () {
            [$user] = createUserWithCompany();
            Company::factory()->count(2)->create(['status' => 1]);
            Company::factory()->create(['status' => 0]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies?status=1');

            $response->assertOk()
                ->assertJsonCount(3, 'data.data');
        });

        it('denies access without permission', function () {
            $company = Company::factory()->create();
            $user = User::factory()->create(['company_id' => $company->id]);
            // 不分配任何角色，用户无 companies.list 权限

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies');

            $response->assertStatus(403);
        });
    });

    describe('Show (Detail)', function () {
        it('returns company detail', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create(['title' => '详情测试']);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/companies/{$company->id}");

            $response->assertOk()
                ->assertJsonPath('data.title', '详情测试');
        });

        it('returns 404 for non-existent company', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates a new company', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/companies', [
                    'title' => '新企业',
                    'address' => '测试地址',
                ]);

            $response->assertOk()
                ->assertJsonPath('data.title', '新企业');

            $this->assertDatabaseHas('companies', ['title' => '新企业']);
        });

        it('denies create for user role', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/companies', [
                    'title' => '无权创建',
                ]);

            $response->assertStatus(403);
        });

        it('validates required title', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/companies', []);

            $response->assertStatus(422);
        });

        it('provisions an admin user and returns one-time credentials', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/companies', [
                    'title' => '子公司甲',
                ]);

            $response->assertOk();

            $companyId = $response->json('data.id');
            $username = $response->json('data.admin_credentials.username');
            $password = $response->json('data.admin_credentials.password');

            expect($username)->toBe("c{$companyId}_admin");
            expect($password)->toBeString()->not->toBeEmpty();

            $admin = User::where('company_id', $companyId)->first();
            expect($admin)->not->toBeNull();
            expect($admin->hasRole('admin'))->toBeTrue();
            expect(Hash::check($password, $admin->password))->toBeTrue();
        });
    });

    describe('Update', function () {
        it('allows admin to update any company', function () {
            [$admin] = createAdminWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($admin, 'api')
                ->putJson("/api/v1/companies/{$company->id}", [
                    'title' => '管理员更新',
                ]);

            $response->assertOk();
        });

        it('denies update for user role', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/companies/{$company->id}", [
                    'title' => '越权更新',
                ]);

            $response->assertStatus(403);
        });

        it('allows creator to update own company (admin)', function () {
            [$admin] = createAdminWithCompany();
            $company = Company::factory()->create(['user_id' => $admin->id]);

            $response = $this->actingAs($admin, 'api')
                ->putJson("/api/v1/companies/{$company->id}", [
                    'title' => '自己的企业',
                ]);

            $response->assertOk();
        });
    });

    describe('Delete', function () {
        it('allows admin to delete any company', function () {
            [$admin] = createAdminWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($admin, 'api')
                ->deleteJson("/api/v1/companies/{$company->id}");

            $response->assertOk();
        });

        it('denies delete for user role', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/companies/{$company->id}");

            $response->assertStatus(403);
        });
    });

    describe('Tree', function () {
        it('returns top-level companies', function () {
            [$user] = createUserWithCompany();
            Company::factory()->count(2)->create(['pid' => 0, 'status' => 1]);
            Company::factory()->create(['pid' => 0, 'status' => 0]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/companies-tree');

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('returns children for given pid', function () {
            [$user] = createUserWithCompany();
            $parent = Company::factory()->create(['pid' => 0, 'status' => 1]);
            Company::factory()->count(3)->create(['pid' => $parent->id, 'status' => 1]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/companies-tree?pid={$parent->id}");

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });
    });

    describe('Review', function () {
        it('allows reviewer to approve company', function () {
            [$reviewer, $reviewerCompany] = createReviewerWithCompany();
            // CompanyPolicy::review requires the pending company to be a direct
            // child (or grandchild) of the reviewer's company.
            $pendingCompany = Company::factory()->pending()->create(['pid' => $reviewerCompany->id]);

            $response = $this->actingAs($reviewer, 'api')
                ->postJson("/api/v1/companies/{$pendingCompany->id}/review", [
                    'status' => 1,
                ]);

            $response->assertOk();
            $this->assertDatabaseHas('companies', ['id' => $pendingCompany->id, 'status' => 1]);
        });

        it('allows super-admin to review', function () {
            [$superAdmin] = createSuperAdminWithCompany();
            $pendingCompany = Company::factory()->pending()->create();

            $response = $this->actingAs($superAdmin, 'api')
                ->postJson("/api/v1/companies/{$pendingCompany->id}/review", [
                    'status' => 1,
                ]);

            $response->assertOk();
        });

        it('denies review for user role', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->pending()->create();

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/companies/{$company->id}/review", [
                    'status' => 1,
                ]);

            $response->assertStatus(403);
        });

        it('denies review for admin role (no review permission)', function () {
            [$admin] = createAdminWithCompany();
            $company = Company::factory()->pending()->create();

            $response = $this->actingAs($admin, 'api')
                ->postJson("/api/v1/companies/{$company->id}/review", [
                    'status' => 1,
                ]);

            $response->assertStatus(403);
        });
    });
});
