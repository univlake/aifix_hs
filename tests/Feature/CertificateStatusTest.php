<?php

use App\Models\CertificateStatus;

describe('CertificateStatus API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            CertificateStatus::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/certificate-statuses');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = CertificateStatus::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/certificate-statuses/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/certificate-statuses/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/certificate-statuses', [
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/certificate-statuses', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/certificate-statuses', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = CertificateStatus::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/certificate-statuses/{$record->id}", ['name' => '证书名称']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = CertificateStatus::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/certificate-statuses/{$record->id}", ['name' => '越权']);

            $response->assertStatus(403);
        });
    });
});
