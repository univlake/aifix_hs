<?php

use App\Models\Company;
use App\Models\EnterpriseType;
use App\Models\OperationalType;
use App\Models\RecordType;
use App\Models\User;

describe('BaseData API', function () {
    it('returns enterprise types', function () {
        [$user] = createUserWithCompany();
        EnterpriseType::factory()->count(3)->create();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/enterprise-types');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    });

    it('returns operational types', function () {
        [$user] = createUserWithCompany();
        OperationalType::factory()->count(2)->create();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/operational-types');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('returns record types', function () {
        [$user] = createUserWithCompany();
        RecordType::factory()->count(4)->create();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/record-types');

        $response->assertOk()
            ->assertJsonCount(4, 'data');
    });

    it('rejects unauthenticated requests', function () {
        $response = $this->getJson('/api/v1/enterprise-types');
        $response->assertStatus(401);
    });

    it('denies access without base-data.view permission', function () {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        // 不分配角色

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/enterprise-types');

        $response->assertStatus(403);
    });
});
