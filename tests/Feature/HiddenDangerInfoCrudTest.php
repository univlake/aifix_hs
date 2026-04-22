<?php

use App\Models\HiddenDangerInfo;

describe('HiddenDangerInfo CRUD', function () {
    it('returns paginated list', function () {
        [$user, $company] = createAdminWithCompany();
        HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => 1,
            'expert_company_id' => 1,
            'area' => '车间A',
            'description' => '隐患描述',
            'hidden_type' => '危化品',
            'hidden_level' => '一般隐患',
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/hidden-danger-infos?company_id='.$company->id)
            ->assertOk()
            ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
    });

    it('returns detail', function () {
        [$user, $company] = createAdminWithCompany();
        $record = HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => 1,
            'expert_company_id' => 1,
            'area' => '车间A',
            'description' => '隐患描述',
            'hidden_type' => '危化品',
            'hidden_level' => '一般隐患',
        ]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/hidden-danger-infos/{$record->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $record->id);
    });

    it('returns 404 for non-existent', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/hidden-danger-infos/99999')
            ->assertStatus(404);
    });

    it('creates record', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/hidden-danger-infos', [
                'company_id' => $company->id,
                'expert_inspection_id' => 1,
                'expert_company_id' => 1,
                'area' => '车间A',
                'description' => '新隐患',
                'hidden_type' => '危化品',
                'hidden_level' => '一般隐患',
            ])
            ->assertOk();
    });

    it('denies create without permission', function () {
        [$user, $company] = createUserWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/hidden-danger-infos', [
                'company_id' => $company->id,
                'expert_inspection_id' => 1,
                'expert_company_id' => 1,
                'area' => '车间A',
                'description' => '新隐患',
                'hidden_type' => '危化品',
                'hidden_level' => '一般隐患',
            ])
            ->assertStatus(403);
    });

    it('updates record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => 1,
            'expert_company_id' => 1,
            'area' => '车间A',
            'description' => '原描述',
            'hidden_type' => '危化品',
            'hidden_level' => '一般隐患',
        ]);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/hidden-danger-infos/{$record->id}", ['description' => '已更新描述'])
            ->assertOk();
    });

    it('denies update without permission', function () {
        [$user, $company] = createUserWithCompany();
        $record = HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => 1,
            'expert_company_id' => 1,
            'area' => '车间A',
            'description' => '原描述',
            'hidden_type' => '危化品',
            'hidden_level' => '一般隐患',
        ]);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/hidden-danger-infos/{$record->id}", ['description' => '越权'])
            ->assertStatus(403);
    });

    it('deletes record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => 1,
            'expert_company_id' => 1,
            'area' => '车间A',
            'description' => '隐患描述',
            'hidden_type' => '危化品',
            'hidden_level' => '一般隐患',
        ]);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/hidden-danger-infos/{$record->id}")
            ->assertOk();
    });
});
