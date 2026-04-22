<?php

use App\Models\ConstructionUnit;

describe('ConstructionUnit API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/construction-units');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/construction-units/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/construction-units/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/construction-units', [
                    'company_id' => $company->id,
                    'name' => '新建设方',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/construction-units', [
                    'company_id' => $company->id,
                    'name' => '新建设方',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/construction-units', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/construction-units/{$record->id}", ['name' => '建设方A']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/construction-units/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/construction-units/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ConstructionUnit::create(['company_id' => $company->id, 'name' => '建设方A']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/construction-units/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
