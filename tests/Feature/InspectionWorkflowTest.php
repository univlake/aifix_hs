<?php

use App\Models\AccidentCheck;
use App\Models\AccidentCheckTemplate;
use App\Models\AddPoint;
use App\Models\AddPointsTemplate;
use App\Models\Company;
use App\Models\NormCheck;
use App\Models\SystemCheck;

describe('AccidentChecks workflow', function () {
    it('startForm returns template tree', function () {
        [$user, $company] = createAdminWithCompany();
        AccidentCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/accident-checks/start-form?company_id='.$company->id.'&year=2026')
            ->assertOk();
    });

    it('save-score creates + updates rows', function () {
        [$user, $company] = createAdminWithCompany();
        $tpl = AccidentCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        // Create
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/accident-checks/save-score', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['accident_check_template_id' => $tpl->id, 'number' => 3.5]],
            ])->assertOk();

        expect(AccidentCheck::where('company_id', $company->id)->count())->toBe(1);
        expect((float) AccidentCheck::where('company_id', $company->id)->value('number'))->toBe(3.5);

        // Update (same keys → no new row)
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/accident-checks/save-score', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['accident_check_template_id' => $tpl->id, 'number' => 5.0, 'comment' => '复核']],
            ])->assertOk();

        expect(AccidentCheck::where('company_id', $company->id)->count())->toBe(1);
        expect((float) AccidentCheck::where('company_id', $company->id)->value('number'))->toBe(5.0);
    });

    it('submissions computes final_number = max(0, 20 - raw) from the parent perspective', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id, 'status' => 1]);
        $tpl = AccidentCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        AccidentCheck::create(['accident_check_template_id' => $tpl->id, 'company_id' => $sub->id, 'year' => 2026, 'number' => 7.5]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/accident-checks/submissions?pid='.$parent->id)
            ->assertOk();

        expect($response->json('data.0.raw_number'))->toBe(7.5);
        expect($response->json('data.0.final_number'))->toBe(12.5); // 20 - 7.5
    });
});

describe('AddPoints workflow', function () {
    it('startForm returns template list', function () {
        [$user, $company] = createAdminWithCompany();
        AddPointsTemplate::create(['title' => 't', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/add-points/start-form?company_id='.$company->id.'&year=2026')
            ->assertOk();
    });

    it('save-score persists rows', function () {
        [$user, $company] = createAdminWithCompany();
        $tpl = AddPointsTemplate::create(['title' => 't', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/add-points/save-score', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['add_points_template_id' => $tpl->id, 'number' => 8]],
            ])->assertOk();

        expect(AddPoint::where('company_id', $company->id)->count())->toBe(1);
    });

    it('submissions returns aggregated list for parent', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id, 'status' => 1]);
        $tpl = AddPointsTemplate::create(['title' => 't', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        AddPoint::create(['add_points_template_id' => $tpl->id, 'company_id' => $sub->id, 'year' => 2026, 'number' => 4]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/add-points/submissions?pid='.$parent->id)
            ->assertOk();
    });
});

describe('NormChecks workflow', function () {
    it('save-score writes rows', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/norm-checks/save-score', [
                'company_id' => $company->id,
                'year' => 2026,
                'number' => 88,
                'type' => '消防',
            ])
            ->assertOk();

        expect(NormCheck::where('company_id', $company->id)->count())->toBe(1);
    });

    it('submissions aggregates norm-checks by year', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id, 'status' => 1]);
        NormCheck::create(['company_id' => $sub->id, 'year' => 2026, 'type' => '消防', 'number' => 90]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/norm-checks/submissions?pid='.$parent->id)
            ->assertOk();
    });

    it('template-link returns link for a known type', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/norm-checks/template-link?type=机械')
            ->assertOk();

        expect($response->json('data.url'))->toContain('机械');
    });

    it('template-link requires type param', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/norm-checks/template-link')
            ->assertStatus(422);
    });
});

describe('SystemChecks workflow', function () {
    it('submissions returns aggregated data', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id, 'status' => 1]);
        SystemCheck::create(['company_id' => $sub->id, 'year' => 2026, 'number_v1' => 20]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/system-checks/submissions?pid='.$parent->id)
            ->assertOk();
    });

    it('computes aggregate score from number_v1..v5', function () {
        [$user, $company] = createAdminWithCompany();
        SystemCheck::create([
            'company_id' => $company->id,
            'year' => 2026,
            'number_v1' => 10,
            'number_v2' => 20,
            'number_v3' => 30,
            'number_v4' => 15,
            'number_v5' => 25,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/system-checks/compute', [
                'company_id' => $company->id,
                'year' => 2026,
            ])
            ->assertOk();
    });
});
