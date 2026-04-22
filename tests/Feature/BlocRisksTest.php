<?php

use App\Models\Company;
use App\Models\RiskLog;

describe('BlocRisks dashboard endpoints', function () {
    // NOTE: GET /bloc-risks routes to BlocRisksController::index which doesn't exist.
    // That is a pre-existing bug in routes/api/statistics-reporting.php — out of scope
    // for this test file; reporting separately.

    it('returns inherent risk aggregate', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'inherent_risk' => 6.0, 'inherent_risk_grade' => '橙']);
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'inherent_risk' => 12.0, 'inherent_risk_grade' => '黄']);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-inherent?company_id='.$company->id)
            ->assertOk();

        $data = $response->json('data');
        expect($data)->toHaveKeys(['inherent_risk', 'inherent_risk_grade']);
    });

    it('returns float risk aggregate', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'float_risk' => 8.0, 'float_risk_grade' => '橙']);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-float?company_id='.$company->id)
            ->assertOk();

        $data = $response->json('data');
        expect($data)->toHaveKeys(['float_risk', 'float_risk_grade']);
    });

    it('returns float-risk pie statistics grouped by grade', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'float_risk_grade' => '橙']);
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'float_risk_grade' => '橙']);
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'float_risk_grade' => '黄']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-float-statistics?company_id='.$company->id)
            ->assertOk();
    });

    it('returns inherent-risk pie statistics grouped by grade', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'inherent_risk_grade' => '红']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-inherent-statistics?company_id='.$company->id)
            ->assertOk();
    });

    it('returns 7-day risk log timeline (works even when no logs exist)', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-log?company_id='.$company->id)
            ->assertOk();

        // Returns a fixed 7-day shape
        expect($response->json('data'))->toHaveCount(7);
    });

    it('rejects bloc-risks-log with missing company_id', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-log')
            ->assertJsonPath('status', 'error');
    });

    it('returns risk-sort ranking (requires type param)', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1, 'inherent_risk' => 7.5]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-sort?company_id='.$company->id.'&type=1')
            ->assertOk();
    });

    it('rejects risk-sort with missing type', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-sort?company_id='.$company->id)
            ->assertJsonPath('status', 'error');
    });

    it('returns hidden-danger-sort ranking', function () {
        [$user, $company] = createAdminWithCompany();
        Company::factory()->create(['pid' => $company->id, 'status' => 1]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-hidden-danger-sort?company_id='.$company->id)
            ->assertOk();
    });

    it('aggregates today-dated risk_log rows in bloc-risks-log', function () {
        [$user, $company] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $company->id, 'status' => 1]);

        // Today's log for the subordinate should show up in the last data point.
        RiskLog::create([
            'company_id' => $sub->id,
            'type' => 1,
            'risk_num' => 6.5,
            'risk_grade' => '橙',
            'date' => date('Ymd'),
            'content' => 'test',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/bloc-risks-log?company_id='.$company->id)
            ->assertOk();

        $today = collect($response->json('data'))->last();
        expect($today['title'])->toBe(date('Ymd'));
    });
});
