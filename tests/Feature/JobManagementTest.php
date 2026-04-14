<?php

use App\Models\JobManagement;

describe('JobManagement API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/job-management');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/job-management/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/job-management/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/job-management', [
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/job-management', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/job-management', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/job-management/{$record->id}", [
                    'department' => '安全部',
                ]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/job-management/{$record->id}", [
                    'department' => '越权',
                ]);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/job-management/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = JobManagement::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/job-management/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
