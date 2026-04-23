<?php

use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\DailyCheckTemplate;

describe('DailyCheck workflow', function () {
    it('submissions validates company_id or pid is present', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/daily-checks/submissions')
            ->assertJsonPath('status', 'error');
    });

    it('submissions lists aggregated rows for a company', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => '模板', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $company->id,
            'year' => 2026,
            'status' => 0,
            'path' => '证据A',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/daily-checks/submissions?company_id='.$company->id)
            ->assertOk();

        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.year'))->toBe(2026);
        expect($response->json('data.0.status'))->toBe(0);
    });

    it('submissions from parent perspective hides drafts by default', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id, 'status' => 1]);
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $sub->id,
            'year' => 2026,
            'status' => 0, // draft — hidden from parent
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/daily-checks/submissions?pid='.$parent->id)
            ->assertOk();

        expect($response->json('data'))->toHaveCount(0);
    });

    it('startForm returns the template tree for a year', function () {
        [$user, $company] = createAdminWithCompany();
        DailyCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/daily-checks/start-form?company_id='.$company->id.'&year=2026')
            ->assertOk();
    });

    it('startForm rejects is_new when a record for that year exists', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $company->id,
            'year' => 2026,
            'status' => 0,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/daily-checks/start-form?company_id='.$company->id.'&year=2026&is_new=1')
            ->assertJsonPath('status', 'error');
    });

    it('save-draft creates draft rows', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [
                    ['daily_check_template_id' => $template->id, 'path' => 'evidence-url'],
                ],
            ])
            ->assertOk();

        expect(DailyCheck::where('company_id', $company->id)->where('status', 0)->count())->toBe(1);
    });

    it('save-draft is idempotent (updates existing row)', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        // First save
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['daily_check_template_id' => $template->id, 'path' => 'v1']],
            ])->assertOk();

        // Second save updates the same row
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['daily_check_template_id' => $template->id, 'path' => 'v2']],
            ])->assertOk();

        expect(DailyCheck::where('company_id', $company->id)->count())->toBe(1);
        expect(DailyCheck::where('company_id', $company->id)->first()->path)->toBe('v2');
    });

    it('save-draft refuses to modify a completed submission', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $company->id,
            'year' => 2026,
            'status' => 1,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [['daily_check_template_id' => $template->id, 'path' => 'try']],
            ])
            ->assertJsonPath('status', 'error');
    });

    it('complete promotes drafts to status=1', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $company->id,
            'year' => 2026,
            'status' => 0,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/complete', [
                'company_id' => $company->id,
                'year' => 2026,
            ])
            ->assertOk();

        expect(DailyCheck::where('company_id', $company->id)->value('status'))->toBe(1);
    });

    it('complete fails when there are no drafts', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/complete', [
                'company_id' => $company->id,
                'year' => 2026,
            ])
            ->assertJsonPath('status', 'error');
    });

    it('score writes numbers + comments and promotes to status=2', function () {
        [$user, $company] = createAdminWithCompany();
        $template = DailyCheckTemplate::create(['title' => 't', 'level' => 2, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheck::create([
            'daily_check_template_id' => $template->id,
            'company_id' => $company->id,
            'year' => 2026,
            'status' => 1,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/score', [
                'company_id' => $company->id,
                'year' => 2026,
                'items' => [
                    ['daily_check_template_id' => $template->id, 'number' => 9.5, 'comment' => '通过'],
                ],
            ])
            ->assertOk();

        $row = DailyCheck::where('company_id', $company->id)->first();
        expect($row->status)->toBe(2);
        expect((float) $row->number)->toBe(9.5);
        expect($row->comment)->toBe('通过');
    });
});
