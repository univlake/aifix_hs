<?php

use App\Models\HiddenDangerInfo;

function makeHiddenDanger(int $companyId): HiddenDangerInfo
{
    return HiddenDangerInfo::create([
        'company_id' => $companyId,
        'expert_inspection_id' => 1,
        'expert_company_id' => 1,
        'area' => '车间A',
        'description' => '初始隐患',
        'hidden_type' => '危化品',
        'hidden_level' => '一般隐患',
        'correct_status' => 1,
    ]);
}

describe('HiddenDanger lifecycle', function () {
    describe('rectify', function () {
        it('records rectification: sets correct_status=2 + correct_date + review_description', function () {
            [$user, $company] = createAdminWithCompany();
            $danger = makeHiddenDanger($company->id);

            $response = $this->actingAs($user, 'api')
                ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/rectify", [
                    'review_description' => '已更换损坏阀门',
                    'correct_date' => '2026-04-22',
                ])
                ->assertOk();

            $danger->refresh();
            expect($danger->correct_status)->toBe(2);
            expect($danger->correct_date)->toContain('2026-04-22');
            expect($danger->review_description)->toBe('已更换损坏阀门');
            expect($danger->zg_user_id)->toBe($user->id);
        });

        it('defaults correct_date to today when omitted', function () {
            [$user, $company] = createAdminWithCompany();
            $danger = makeHiddenDanger($company->id);

            $this->actingAs($user, 'api')
                ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/rectify", [
                    'review_description' => '完成整改',
                ])
                ->assertOk();

            $danger->refresh();
            expect($danger->correct_date)->toContain(date('Y-m-d'));
        });

        it('validates review_description is required', function () {
            [$user, $company] = createAdminWithCompany();
            $danger = makeHiddenDanger($company->id);

            $this->actingAs($user, 'api')
                ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/rectify", [])
                ->assertStatus(422);
        });

        it('returns 404 for non-existent danger', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->postJson('/api/v1/hidden-danger-infos/99999/rectify', [
                    'review_description' => '不存在',
                ])
                ->assertStatus(404);
        });
    });

    describe('confirm-rectification', function () {
        it('records confirmation: sets correct_status=3 + review_user_id + review_time', function () {
            [$user, $company] = createAdminWithCompany();
            $danger = makeHiddenDanger($company->id);
            $danger->update(['correct_status' => 2]); // already rectified

            $this->actingAs($user, 'api')
                ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/confirm-rectification", [])
                ->assertOk();

            $danger->refresh();
            expect($danger->correct_status)->toBe(3);
            expect($danger->review_user_id)->toBe($user->id);
            expect($danger->review_time)->not->toBeNull();
        });

        it('returns 404 for non-existent danger on confirm', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->postJson('/api/v1/hidden-danger-infos/99999/confirm-rectification', [])
                ->assertStatus(404);
        });
    });

    describe('archive', function () {
        it('archives: sets invest_status=2 + archive_user_id', function () {
            [$user, $company] = createAdminWithCompany();
            $danger = makeHiddenDanger($company->id);
            $danger->update(['correct_status' => 3]); // confirmed

            $this->actingAs($user, 'api')
                ->postJson("/api/v1/hidden-danger-infos/{$danger->id}/archive")
                ->assertOk();

            $danger->refresh();
            expect($danger->invest_status)->toBe(2);
            expect($danger->archive_user_id)->toBe($user->id);
        });

        it('returns 404 for non-existent danger on archive', function () {
            [$user] = createAdminWithCompany();

            $this->actingAs($user, 'api')
                ->postJson('/api/v1/hidden-danger-infos/99999/archive')
                ->assertStatus(404);
        });
    });
});
