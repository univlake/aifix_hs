<?php

use App\Models\SpecialEquipment;

describe('SpecialEquipment API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/special-equipment');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/special-equipment/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/special-equipment/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-equipment', [
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-equipment', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-equipment', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/special-equipment/{$record->id}", ['name' => '电梯A']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/special-equipment/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/special-equipment/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = SpecialEquipment::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/special-equipment/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
