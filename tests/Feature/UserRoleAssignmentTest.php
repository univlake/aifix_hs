<?php

use App\Models\User;

describe('User role assignment', function () {
    it('assigns a role to a user in the same company', function () {
        [$admin, $company] = createSuperAdminWithCompany();
        $peer = User::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$peer->id}/role", ['role' => 'reviewer']);

        $response->assertOk();
        expect($peer->fresh()->hasRole('reviewer'))->toBeTrue();
    });

    it('replaces any existing roles (syncRoles semantics)', function () {
        [$admin, $company] = createSuperAdminWithCompany();
        $peer = User::factory()->create(['company_id' => $company->id]);
        $peer->assignRole('reviewer');

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$peer->id}/role", ['role' => 'user']);

        $response->assertOk();
        expect($peer->fresh()->hasRole('reviewer'))->toBeFalse()
            ->and($peer->fresh()->hasRole('user'))->toBeTrue();
    });

    it('rejects unknown role names', function () {
        [$admin, $company] = createSuperAdminWithCompany();
        $peer = User::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$peer->id}/role", ['role' => 'not-a-real-role']);

        $response->assertStatus(422);
    });

    it('returns 404 for a user outside the admin own-company scope', function () {
        [$admin] = createSuperAdminWithCompany();
        $outsider = User::factory()->create();

        $response = $this->actingAs($admin, 'api')
            ->putJson("/api/v1/users/{$outsider->id}/role", ['role' => 'user']);

        $response->assertStatus(404);
    });
});
