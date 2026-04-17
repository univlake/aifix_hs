<?php

use App\Models\RiskDistributionMap;

describe('RiskDistributionMap API', function () {
    it('queries the risk_distribution_maps table', function () {
        expect((new RiskDistributionMap)->getTable())->toBe('risk_distribution_maps');
    });

    describe('Index', function () {
        it('returns null when no record exists for company', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/risk-distribution-maps?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonPath('data', null);
        });

        it('returns the record for the given company', function () {
            [$user, $company] = createAdminWithCompany();
            RiskDistributionMap::create([
                'annex_url' => 'https://example.com/map.png',
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/risk-distribution-maps?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonPath('data.annex_url', 'https://example.com/map.png');
        });
    });

    describe('Store', function () {
        it('creates a record in risk_distribution_maps', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/risk-distribution-maps', [
                    'annex_url' => 'https://example.com/risk-map.pdf',
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
            $this->assertDatabaseHas('risk_distribution_maps', [
                'annex_url' => 'https://example.com/risk-map.pdf',
                'company_id' => $company->id,
            ]);
        });
    });

    describe('Update', function () {
        it('updates annex_url in risk_distribution_maps', function () {
            [$user, $company] = createAdminWithCompany();
            $record = RiskDistributionMap::create([
                'annex_url' => 'https://example.com/old.png',
                'company_id' => $company->id,
            ]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/risk-distribution-maps/{$record->id}", [
                    'annex_url' => 'https://example.com/new.png',
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
            $this->assertDatabaseHas('risk_distribution_maps', [
                'id' => $record->id,
                'annex_url' => 'https://example.com/new.png',
            ]);
        });
    });
});
