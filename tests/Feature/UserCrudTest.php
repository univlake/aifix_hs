<?php

use App\Models\User;

describe('User CRUD', function () {
    it('lists users in own company', function () {
        [$user, $company] = createAdminWithCompany();
        User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
    });

    it('returns user detail', function () {
        [$admin, $company] = createAdminWithCompany();
        $other = User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/users/{$other->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $other->id);
    });

    it('returns 404 for cross-company user', function () {
        [$admin] = createAdminWithCompany();
        // Create a user in a different company
        [, $otherCompany] = createAdminWithCompany();
        $stranger = User::factory()->create(['company_id' => $otherCompany->id]);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/users/{$stranger->id}")
            ->assertStatus(404);
    });

    it('creates user with required fields', function () {
        [$admin, $company] = createAdminWithCompany();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/users', [
                'username' => 'newuser_'.uniqid(),
                'password' => 'Pass1234',
                'nickname' => '新用户',
                'company_id' => $company->id,
            ])
            ->assertOk();
    });

    it('denies create for non-admin', function () {
        [$user, $company] = createUserWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/users', [
                'username' => 'rejected_'.uniqid(),
                'password' => 'Pass1234',
                'nickname' => '被拒',
                'company_id' => $company->id,
            ])
            ->assertStatus(403);
    });

    it('updates user nickname', function () {
        [$admin, $company] = createAdminWithCompany();
        $other = User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$other->id}", ['nickname' => '已更名'])
            ->assertOk();
    });

});
