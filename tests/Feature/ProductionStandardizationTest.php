<?php

use App\Models\ProductionStandardization;

describe('ProductionStandardization API', function () {
    describe('Index (List)', function () {
        it('returns record', function () {
            [$user, $company] = createAdminWithCompany();
            ProductionStandardization::create([
                'company_id' => $company->id,
                'grade' => '三级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/production-standardizations');

            $response->assertOk();
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/production-standardizations', [
                    'company_id' => $company->id,
                    'grade' => '二级',
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/production-standardizations', [
                    'company_id' => $company->id,
                    'grade' => '二级',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/production-standardizations', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = ProductionStandardization::create([
                'company_id' => $company->id,
                'grade' => '三级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/production-standardizations/{$record->id}", [
                    'grade' => '一级',
                ]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = ProductionStandardization::create([
                'company_id' => $company->id,
                'grade' => '三级',
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/production-standardizations/{$record->id}", [
                    'grade' => '越权',
                ]);

            $response->assertStatus(403);
        });
    });
});
