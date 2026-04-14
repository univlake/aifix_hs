<?php

use App\Models\SafetyArchitecture;

describe('SafetyArchitecture API', function () {
    describe('Index (List)', function () {
        it('returns record', function () {
            [$user, $company] = createAdminWithCompany();
            SafetyArchitecture::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/safety-architectures');

            $response->assertOk();
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/safety-architectures', [
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/safety-architectures', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/safety-architectures', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = SafetyArchitecture::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/safety-architectures/{$record->id}", [
                    'thumbnail_url' => 'http://example.com/img.png',
                ]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = SafetyArchitecture::create([
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/safety-architectures/{$record->id}", [
                    'thumbnail_url' => 'http://example.com/img.png',
                ]);

            $response->assertStatus(403);
        });
    });
});
