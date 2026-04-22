<?php

use App\Models\FloatRiskLog;
use App\Models\InherentRiskLog;

describe('InherentRiskLog API', function () {
    it('lists logs scoped to company_id', function () {
        [$user, $company] = createAdminWithCompany();
        InherentRiskLog::create(['company_id' => $company->id, 'safety_architecture_value' => 5.5]);
        InherentRiskLog::create(['company_id' => $company->id, 'safety_architecture_value' => 6.0]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/inherent-risk-logs?company_id='.$company->id);

        $response->assertOk()->assertJsonCount(2, 'data.data');
    });

    it('runs CRUD', function () {
        [$user, $company] = createAdminWithCompany();

        $create = $this->actingAs($user, 'api')
            ->postJson('/api/v1/inherent-risk-logs', [
                'company_id' => $company->id,
                'safety_architecture_value' => 3.2,
            ]);
        $create->assertOk();
        $id = $create->json('data.id');

        $show = $this->actingAs($user, 'api')->getJson("/api/v1/inherent-risk-logs/{$id}");
        $show->assertOk()->assertJsonPath('data.id', $id);

        $update = $this->actingAs($user, 'api')
            ->putJson("/api/v1/inherent-risk-logs/{$id}", ['safety_architecture_value' => 9.9]);
        $update->assertOk();

        $delete = $this->actingAs($user, 'api')->deleteJson("/api/v1/inherent-risk-logs/{$id}");
        $delete->assertOk();
    });
});

describe('FloatRiskLog API', function () {
    it('lists logs scoped to company_id', function () {
        [$user, $company] = createAdminWithCompany();
        FloatRiskLog::create(['company_id' => $company->id, 'internal_meeting_scale' => 1.1]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/float-risk-logs?company_id='.$company->id);

        $response->assertOk()->assertJsonCount(1, 'data.data');
    });

    it('runs CRUD', function () {
        [$user, $company] = createAdminWithCompany();

        $create = $this->actingAs($user, 'api')
            ->postJson('/api/v1/float-risk-logs', [
                'company_id' => $company->id,
                'internal_meeting_scale' => 2.0,
            ]);
        $create->assertOk();
        $id = $create->json('data.id');

        $update = $this->actingAs($user, 'api')
            ->putJson("/api/v1/float-risk-logs/{$id}", ['internal_meeting_scale' => 3.0]);
        $update->assertOk();

        $delete = $this->actingAs($user, 'api')->deleteJson("/api/v1/float-risk-logs/{$id}");
        $delete->assertOk();
    });
});
