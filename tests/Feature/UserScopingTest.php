<?php

use App\Models\Company;
use App\Models\User;

describe('User management scoping', function () {
    it('index returns only users from the caller\'s own company', function () {
        [$admin, $company] = createAdminWithCompany();
        $other = Company::factory()->create();

        $peer = User::factory()->create(['company_id' => $company->id, 'username' => 'peer']);
        $stranger = User::factory()->create(['company_id' => $other->id, 'username' => 'stranger']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/v1/users');

        $response->assertOk();
        $usernames = collect($response->json('data.data'))->pluck('username')->all();
        expect($usernames)->toContain($peer->username, $admin->username)
            ->and($usernames)->not->toContain($stranger->username);
    });

    it('show 404s when target user belongs to a different company', function () {
        [$admin] = createAdminWithCompany();
        $other = Company::factory()->create();
        $stranger = User::factory()->create(['company_id' => $other->id]);

        $response = $this->actingAs($admin, 'api')->getJson("/api/v1/users/{$stranger->id}");

        $response->assertStatus(404);
    });

    it('store forces the new user\'s company to the caller\'s company', function () {
        [$admin, $company] = createAdminWithCompany();
        $other = Company::factory()->create();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/users', [
            'username' => 'scoped_user',
            'password' => 'secret123',
            'nickname' => '受限用户',
            'company_id' => $other->id, // should be ignored
        ]);

        $response->assertOk();
        $created = User::where('username', 'scoped_user')->first();
        expect($created)->not->toBeNull()
            ->and($created->company_id)->toBe($company->id);
    });

    it('update 404s when target user belongs to a different company', function () {
        [$admin] = createAdminWithCompany();
        $other = Company::factory()->create();
        $stranger = User::factory()->create(['company_id' => $other->id]);

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$stranger->id}", ['nickname' => '越权改名']);

        $response->assertStatus(404);
        expect($stranger->fresh()->nickname)->not->toBe('越权改名');
    });

    it('update ignores company_id in payload', function () {
        [$admin, $company] = createAdminWithCompany();
        $other = Company::factory()->create();
        $peer = User::factory()->create(['company_id' => $company->id, 'nickname' => '原名']);

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$peer->id}", [
                'nickname' => '新名',
                'company_id' => $other->id,
            ]);

        $response->assertOk();
        expect($peer->fresh()->company_id)->toBe($company->id)
            ->and($peer->fresh()->nickname)->toBe('新名');
    });

    it('reset-password 404s when target user belongs to a different company', function () {
        [$admin] = createAdminWithCompany();
        $other = Company::factory()->create();
        $stranger = User::factory()->create(['company_id' => $other->id]);

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$stranger->id}/password", ['password' => 'newsecret']);

        $response->assertStatus(404);
    });
});
