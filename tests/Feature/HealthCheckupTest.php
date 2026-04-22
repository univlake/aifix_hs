<?php

use App\Models\HealthCheckup;

describe('HealthCheckup API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗中',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/health-checkups');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗后',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/health-checkups/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.type', '岗后');
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/health-checkups/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/health-checkups', [
                    'company_id' => $company->id,
                    'type' => '岗前',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/health-checkups', [
                    'company_id' => $company->id,
                    'type' => '岗前',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/health-checkups', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗前',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/health-checkups/{$record->id}", ['type' => '岗中']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗前',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/health-checkups/{$record->id}", ['type' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗前',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/health-checkups/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = HealthCheckup::create([
                'company_id' => $company->id,
                'type' => '岗前',
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/health-checkups/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
