<?php

use App\Models\Company;

describe('ValidateScopeCompany middleware', function () {
    it('allows GET with company_id equal to own company', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/personnels?company_id='.$company->id);

        $response->assertOk();
    });

    it('allows GET with company_id of a direct subordinate', function () {
        [$user, $rootCompany] = createAdminWithCompany();
        $child = Company::factory()->create(['pid' => $rootCompany->id]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/personnels?company_id='.$child->id);

        $response->assertOk();
    });

    it('rejects GET with company_id of an unrelated company', function () {
        [$user] = createAdminWithCompany();
        $stranger = Company::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/personnels?company_id='.$stranger->id);

        $response->assertStatus(403)
            ->assertJsonPath('message', '无权访问该企业数据');
    });

    it('rejects GET with nonexistent company_id', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/personnels?company_id=999999');

        $response->assertStatus(403)
            ->assertJsonPath('message', '无效的企业范围');
    });

    it('does not validate company_id in POST body (admin can assign to other companies)', function () {
        [$user] = createAdminWithCompany();
        $stranger = Company::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/personnels', [
                'name' => '测试人员',
                'company_id' => $stranger->id,
            ]);

        // Whether the controller then accepts or rejects the payload is its own concern;
        // the middleware must not produce a 403.
        expect($response->status())->not->toBe(403);
    });

    it('allows requests without company_id (global endpoints)', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/users');

        $response->assertOk();
    });

    it('honours the X-Scope-Company-Id header in addition to query params', function () {
        [$user] = createAdminWithCompany();
        $stranger = Company::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->withHeaders(['X-Scope-Company-Id' => (string) $stranger->id])
            ->getJson('/api/v1/personnels');

        $response->assertStatus(403);
    });
});
