<?php

use App\Models\AccidentCheck;
use App\Models\AccidentCheckTemplate;
use App\Models\AddPoint;
use App\Models\AddPointsTemplate;
use App\Models\Company;
use App\Models\NormCheck;

describe('Assessment scoring extra tabs', function () {
    it('accident: start-form returns tree and save-score upserts', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;
        $l1 = AccidentCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '1-10']);
        $l2 = AccidentCheckTemplate::create(['title' => '二级', 'level' => 2, 'sort' => 1, 'pid' => $l1->id, 'year' => $year, 'score_range' => '1-10']);

        $start = $this->actingAs($user, 'api')
            ->getJson("/api/v1/accident-checks/start-form?company_id={$sub->id}&year={$year}");
        $start->assertOk();

        $save = $this->actingAs($user, 'api')
            ->postJson('/api/v1/accident-checks/save-score', [
                'company_id' => $sub->id,
                'year' => $year,
                'items' => [
                    ['accident_check_template_id' => $l2->id, 'number' => 5.5, 'comment' => '扣5.5'],
                ],
            ]);
        $save->assertOk();
        expect((float) AccidentCheck::where('company_id', $sub->id)->value('number'))->toBe(5.5);
    });

    it('accident: submissions computes final_number = max(0, 20 - sum)', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;

        $l1 = AccidentCheckTemplate::create(['title' => '一级', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '-']);
        $l2 = AccidentCheckTemplate::create(['title' => '二级', 'level' => 2, 'sort' => 1, 'pid' => $l1->id, 'year' => $year, 'score_range' => '-']);

        AccidentCheck::create(['accident_check_template_id' => $l2->id, 'company_id' => $sub->id, 'year' => $year, 'number' => 8]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/accident-checks/submissions?pid={$parent->id}&year={$year}");
        $response->assertOk();
        $data = $response->json('data');
        expect($data)->toHaveCount(1);
        expect((float) $data[0]['raw_number'])->toBe(8.0);
        expect((float) $data[0]['final_number'])->toBe(12.0);
    });

    it('add-points: save-score + submissions sums correctly', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;
        $tpl = AddPointsTemplate::create(['title' => '加分项A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => $year, 'score_range' => '0-5']);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/add-points/save-score', [
                'company_id' => $sub->id,
                'year' => $year,
                'items' => [
                    ['add_points_template_id' => $tpl->id, 'number' => 3.5, 'comment' => 'good'],
                ],
            ])->assertOk();

        expect((float) AddPoint::where('company_id', $sub->id)->value('number'))->toBe(3.5);

        $list = $this->actingAs($user, 'api')
            ->getJson("/api/v1/add-points/submissions?pid={$parent->id}&year={$year}");
        $list->assertOk();
        expect($list->json('data.0.total_number'))->toBe(3.5);
    });

    it('norm: save-score upserts per company+year and converts score', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/norm-checks/save-score', [
                'company_id' => $sub->id,
                'year' => $year,
                'type' => '危化',
                'number' => 80,
            ])->assertOk();

        $list = $this->actingAs($user, 'api')
            ->getJson("/api/v1/norm-checks/submissions?pid={$parent->id}&year={$year}");
        $list->assertOk();
        expect($list->json('data.0.type'))->toBe('危化')
            ->and($list->json('data.0.raw_number'))->toBe(80)
            ->and((float) $list->json('data.0.final_number'))->toBe(16.0); // 80/100 * 20 = 16

        // Upsert: call again with different score
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/norm-checks/save-score', [
                'company_id' => $sub->id,
                'year' => $year,
                'type' => '危化',
                'number' => 95,
            ])->assertOk();

        expect(NormCheck::where('company_id', $sub->id)->where('year', $year)->count())->toBe(1);
        expect((int) NormCheck::where('company_id', $sub->id)->value('number'))->toBe(95);
    });

    it('system: compute derives score and upserts', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/system-checks/compute', [
                'company_id' => $sub->id,
                'year' => $year,
            ]);
        $response->assertOk();
        $data = $response->json('data');
        expect($data['company_id'])->toBe($sub->id)
            ->and($data['year'])->toBe($year)
            ->and($data)->toHaveKeys(['number_v1', 'number_v4', 'number_v5', 'number']);

        // Idempotent
        $this->actingAs($user, 'api')
            ->postJson('/api/v1/system-checks/compute', [
                'company_id' => $sub->id,
                'year' => $year,
            ])->assertOk();

        $list = $this->actingAs($user, 'api')
            ->getJson("/api/v1/system-checks/submissions?pid={$parent->id}&year={$year}");
        $list->assertOk();
        expect($list->json('data'))->toHaveCount(1);
    });
});
