<?php

use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\DailyCheckTemplate;

describe('Assessment filing workflow', function () {
    it('start-form returns 3-level tree and is_new rejects duplicates', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;

        $parent = DailyCheckTemplate::create(['title' => '一级A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        DailyCheckTemplate::create(['title' => '二级A1', 'level' => 2, 'sort' => 1, 'pid' => $parent->id, 'year' => $year, 'score_range' => '1-10']);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/start-form?company_id={$company->id}&year={$year}&is_new=1");
        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);

        DailyCheck::create([
            'daily_check_template_id' => $parent->id,
            'company_id' => $company->id,
            'year' => $year,
            'status' => 0,
        ]);

        $dup = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/start-form?company_id={$company->id}&year={$year}&is_new=1");
        $dup->assertStatus(400);
    });

    it('save-draft upserts rows and keeps status=0', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        $parent = DailyCheckTemplate::create(['title' => '一级A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        $child = DailyCheckTemplate::create(['title' => '二级A1', 'level' => 2, 'sort' => 1, 'pid' => $parent->id, 'year' => $year, 'score_range' => '1-10']);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => $year,
                'items' => [
                    ['daily_check_template_id' => $child->id, 'path' => 'https://oss/a.pdf,https://oss/b.pdf'],
                ],
            ]);
        $response->assertOk();
        $row = DailyCheck::where('company_id', $company->id)->where('year', $year)->first();
        expect($row->path)->toBe('https://oss/a.pdf,https://oss/b.pdf')
            ->and($row->status)->toBe(0);

        // Second save-draft updates the same row
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => $year,
                'items' => [
                    ['daily_check_template_id' => $child->id, 'path' => 'https://oss/c.pdf'],
                ],
            ])->assertOk();
        expect(DailyCheck::where('company_id', $company->id)->where('year', $year)->count())->toBe(1);
        expect(DailyCheck::where('company_id', $company->id)->first()->path)->toBe('https://oss/c.pdf');
    });

    it('complete transitions drafts to status=1 and blocks subsequent save-draft', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        $parent = DailyCheckTemplate::create(['title' => '一级A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        $child = DailyCheckTemplate::create(['title' => '二级A1', 'level' => 2, 'sort' => 1, 'pid' => $parent->id, 'year' => $year, 'score_range' => '1-10']);

        DailyCheck::create([
            'daily_check_template_id' => $child->id,
            'company_id' => $company->id,
            'year' => $year,
            'status' => 0,
            'path' => 'https://oss/a.pdf',
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/complete', [
                'company_id' => $company->id,
                'year' => $year,
            ]);
        $response->assertOk();
        expect(DailyCheck::where('company_id', $company->id)->where('year', $year)->value('status'))->toBe(1);

        $blocked = $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => $year,
                'items' => [
                    ['daily_check_template_id' => $child->id, 'path' => 'changed'],
                ],
            ]);
        $blocked->assertStatus(403);
    });

    it('score updates number/comment and marks rows as scored (status=2); supports 0.5 increments', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;
        $tpl = DailyCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        $child = DailyCheckTemplate::create(['title' => '二级', 'level' => 2, 'sort' => 1, 'pid' => $tpl->id, 'year' => $year, 'score_range' => '1-10']);

        DailyCheck::create([
            'daily_check_template_id' => $child->id,
            'company_id' => $sub->id,
            'year' => $year,
            'status' => 1,
            'path' => 'https://oss/a.pdf',
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/score', [
                'company_id' => $sub->id,
                'year' => $year,
                'items' => [
                    ['daily_check_template_id' => $child->id, 'number' => 8.5, 'comment' => '材料齐全'],
                ],
            ]);
        $response->assertOk();
        $row = DailyCheck::where('company_id', $sub->id)->where('year', $year)->first();
        expect($row->status)->toBe(2)
            ->and((float) $row->number)->toBe(8.5)
            ->and($row->comment)->toBe('材料齐全');
    });

    it('filer can read (but not edit) submissions after completion', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        $tpl = DailyCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);

        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $company->id, 'year' => $year, 'status' => 1]);

        // Listing without status filter now returns completed rows too.
        $list = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/submissions?company_id={$company->id}");
        $list->assertOk();
        expect($list->json('data'))->toHaveCount(1)
            ->and($list->json('data.0.status'))->toBe(1);

        // Showing submission detail is allowed.
        $show = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/submission?company_id={$company->id}&year={$year}");
        $show->assertOk();

        // Save-draft / destroy-form are blocked.
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/daily-checks/save-draft', [
                'company_id' => $company->id,
                'year' => $year,
                'items' => [['daily_check_template_id' => $tpl->id, 'path' => 'x']],
            ])->assertStatus(403);
        $this->actingAs($user, 'api')
            ->deleteJson('/api/v1/daily-checks/destroy-form', ['company_id' => $company->id, 'year' => $year])
            ->assertStatus(403);
    });

    it('submissions with pid returns only completed/scored from subordinates', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $other = Company::factory()->create();
        $year = 2024;

        $tpl = DailyCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $sub->id, 'year' => $year, 'status' => 0]);
        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $sub->id, 'year' => $year - 1, 'status' => 1]);
        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $other->id, 'year' => $year, 'status' => 1]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/submissions?pid={$parent->id}");
        $response->assertOk();
        $data = $response->json('data');
        expect($data)->toHaveCount(1);
        expect($data[0]['company_id'])->toBe($sub->id);
        expect($data[0]['year'])->toBe($year - 1);
        expect($data[0]['status'])->toBe(1);
    });

    it('super-admin has daily-checks permissions after seeder runs', function () {
        [$user, $company] = createSuperAdminWithCompany();

        expect($user->can('daily-checks.list'))->toBeTrue()
            ->and($user->can('daily-checks.create'))->toBeTrue()
            ->and($user->can('daily-checks.update'))->toBeTrue()
            ->and($user->can('daily-checks.delete'))->toBeTrue();

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/daily-checks/submissions?company_id={$company->id}");
        $response->assertOk();
    });

    it('destroy-form deletes drafts but refuses completed submissions', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        $tpl = DailyCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $company->id, 'year' => $year, 'status' => 0]);

        $this->actingAs($user, 'api')
            ->deleteJson('/api/v1/daily-checks/destroy-form', ['company_id' => $company->id, 'year' => $year])
            ->assertOk();
        expect(DailyCheck::where('company_id', $company->id)->where('year', $year)->count())->toBe(0);

        DailyCheck::create(['daily_check_template_id' => $tpl->id, 'company_id' => $company->id, 'year' => $year, 'status' => 1]);
        $this->actingAs($user, 'api')
            ->deleteJson('/api/v1/daily-checks/destroy-form', ['company_id' => $company->id, 'year' => $year])
            ->assertStatus(403);
    });
});
