<?php

use App\Enums\SecurityInvestmentType;
use App\Models\SecurityInvestment;

describe('SecurityInvestment API', function () {
    it('creates with enum type and 4-digit year', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/security-investments', [
                'company_id' => $company->id,
                'year' => '2026',
                'type' => SecurityInvestmentType::Safety->value,
                'title' => '2026 年度安全投入',
                'budget' => 100,
                'last_year_income' => 10000,
            ]);

        $response->assertOk();

        $record = SecurityInvestment::latest('id')->first();
        expect($record->year)->toBe('2026');
        expect($record->type)->toBe('安全投入');
    });

    it('rejects type not in enum', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/security-investments', [
                'company_id' => $company->id,
                'year' => '2026',
                'type' => '其他投入',
                'budget' => 10,
            ]);

        $response->assertStatus(422);
    });

    it('rejects non-4-digit year', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/security-investments', [
                'company_id' => $company->id,
                'year' => '26',
                'type' => SecurityInvestmentType::Safety->value,
                'budget' => 10,
            ]);

        $response->assertStatus(422);
    });

    it('accepts nullable year and type', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/security-investments', [
                'company_id' => $company->id,
                'budget' => 10,
            ]);

        $response->assertOk();
    });
});
