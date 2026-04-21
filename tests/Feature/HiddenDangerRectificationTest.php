<?php

use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\ExpertInspectionUser;
use App\Models\HiddenDangerInfo;

function createDanger(int $companyId, int $checkCompanyId): HiddenDangerInfo
{
    $inspection = ExpertInspection::create([
        'company_id' => $companyId,
        'title' => '检查A',
    ]);
    $expertCompany = ExpertCompany::create([
        'expert_inspection_id' => $inspection->id,
        'check_company_id' => $checkCompanyId,
        'company_id' => $companyId,
    ]);

    return HiddenDangerInfo::create([
        'company_id' => $companyId,
        'expert_inspection_id' => $inspection->id,
        'expert_company_id' => $expertCompany->id,
        'check_company_id' => $checkCompanyId,
        'area' => '生产车间',
        'description' => '临时堆放',
        'hidden_type' => '基础管理',
        'hidden_level' => '一般隐患',
    ]);
}

describe('Hidden danger rectification workflow', function () {
    it('rectify auto-fills zg_user_id + correct_date + review_description and status=2', function () {
        [$user, $company] = createAdminWithCompany();
        $danger = createDanger($company->id, $company->id);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/rectify", [
                'review_description' => '已清理堆放物',
                'hiddenRectifyAnnex' => [
                    ['geolocation' => 'x', 'annex_url' => 'https://x/a.jpg'],
                ],
            ]);

        $response->assertOk();
        $fresh = $danger->fresh();
        expect($fresh->zg_user_id)->toBe($user->id);
        expect($fresh->correct_date)->not->toBeNull();
        expect($fresh->review_description)->toBe('已清理堆放物');
        expect((int) $fresh->correct_status)->toBe(2);
        expect($fresh->hiddenRectifyAnnex)->toHaveCount(1);
    });

    it('rectify validates required description', function () {
        [$user, $company] = createAdminWithCompany();
        $danger = createDanger($company->id, $company->id);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/rectify", []);

        $response->assertStatus(422);
    });

    it('confirmRectification auto-fills review_user_id + review_time and status=3', function () {
        [$user, $company] = createAdminWithCompany();
        $danger = createDanger($company->id, $company->id);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/confirm-rectification", []);

        $response->assertOk();
        $fresh = $danger->fresh();
        expect($fresh->review_user_id)->toBe($user->id);
        expect($fresh->review_time)->not->toBeNull();
        expect((int) $fresh->correct_status)->toBe(3);
    });

    it('archive auto-fills archive_user_id + invest_status=2', function () {
        [$user, $company] = createAdminWithCompany();
        $danger = createDanger($company->id, $company->id);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/archive");

        $response->assertOk();
        $fresh = $danger->fresh();
        expect($fresh->archive_user_id)->toBe($user->id);
        expect((int) $fresh->invest_status)->toBe(2);
    });

    it('index filters by expert_user_id through expert_inspection_users', function () {
        [$user, $company] = createAdminWithCompany();
        $inspection = ExpertInspection::create(['company_id' => $company->id, 'title' => 'IA']);
        $ec = ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $company->id,
            'company_id' => $company->id,
        ]);
        ExpertInspectionUser::create([
            'expert_user_id' => $user->id,
            'expert_company_id' => $ec->id,
            'company_id' => $company->id,
        ]);
        HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => $inspection->id,
            'expert_company_id' => $ec->id,
            'check_company_id' => $company->id,
            'area' => 'A', 'description' => 'x',
            'hidden_type' => '电气', 'hidden_level' => '一般隐患',
        ]);
        $other = ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $company->id,
            'company_id' => $company->id,
        ]);
        HiddenDangerInfo::create([
            'company_id' => $company->id,
            'expert_inspection_id' => $inspection->id,
            'expert_company_id' => $other->id,
            'check_company_id' => $company->id,
            'area' => 'B', 'description' => 'y',
            'hidden_type' => '电气', 'hidden_level' => '一般隐患',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/hidden-danger-infos?expert_user_id={$user->id}");

        $response->assertOk()->assertJsonCount(1, 'data.data');
    });
});
