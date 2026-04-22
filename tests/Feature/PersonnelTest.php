<?php

use App\Models\Company;
use App\Models\Personnel;
use App\Models\User;

describe('Personnel API', function () {
    describe('Index (List)', function () {
        it('returns paginated personnel list', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create();
            Personnel::factory()->count(3)->create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/personnels');

            $response->assertOk()
                ->assertJsonCount(3, 'data.data');
        });

        it('filters by company_id', function () {
            [$user, $company1] = createUserWithCompany();
            $company2 = Company::factory()->create();
            Personnel::factory()->count(2)->create(['company_id' => $company1->id]);
            Personnel::factory()->create(['company_id' => $company2->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/personnels?company_id={$company1->id}");

            $response->assertOk()
                ->assertJsonCount(2, 'data.data');
        });

        it('denies access without permission', function () {
            $company = Company::factory()->create();
            $user = User::factory()->create(['company_id' => $company->id]);
            // 不分配角色

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/personnels');

            $response->assertStatus(403);
        });
    });

    describe('Show (Detail)', function () {
        it('returns personnel detail', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create();
            $personnel = Personnel::factory()->create([
                'company_id' => $company->id,
                'total_people' => 100,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/personnels/{$personnel->id}");

            $response->assertOk()
                ->assertJsonPath('data.total_people', 100);
        });

        it('returns 404 for non-existent personnel', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/personnels/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates personnel record', function () {
            [$user] = createAdminWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/personnels', [
                    'company_id' => $company->id,
                    'total_people' => 50,
                ]);

            $response->assertOk();
        });

        it('denies create for user role', function () {
            [$user] = createUserWithCompany();
            $company = Company::factory()->create();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/personnels', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });
    });

    describe('Update', function () {
        it('updates personnel record', function () {
            [$user] = createAdminWithCompany();
            $company = Company::factory()->create();
            $personnel = Personnel::factory()->create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/personnels/{$personnel->id}", [
                    'total_people' => 200,
                ]);

            $response->assertOk()
                ->assertJsonPath('data.total_people', 200);
        });
    });

    describe('Delete', function () {
        it('soft deletes personnel', function () {
            [$user] = createAdminWithCompany();
            $company = Company::factory()->create();
            $personnel = Personnel::factory()->create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/personnels/{$personnel->id}");

            $response->assertOk();
            $this->assertSoftDeleted('personnels', ['id' => $personnel->id]);
        });
    });
});
