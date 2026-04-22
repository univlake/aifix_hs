<?php

describe('GET /api/v1/permissions', function () {
    it('returns every permission for super-admin', function () {
        [$superAdmin] = createSuperAdminWithCompany();

        $response = $this->actingAs($superAdmin, 'api')->getJson('/api/v1/permissions');

        $response->assertOk()
            ->assertJsonStructure(['status', 'data' => ['list', 'grouped']]);
        expect(count($response->json('data.list')))->toBeGreaterThan(100);
    });

    it('is 403 for users without permissions.list', function () {
        [$admin] = createAdminWithCompany();

        $response = $this->actingAs($admin, 'api')->getJson('/api/v1/permissions');

        $response->assertStatus(403);
    });

    it('is 401 when unauthenticated', function () {
        $response = $this->getJson('/api/v1/permissions');
        $response->assertStatus(401);
    });
});
