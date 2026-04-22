<?php

use App\Models\AccidentCheckTemplate;
use App\Models\AddPointsTemplate;
use App\Models\DailyCheckTemplate;

describe('Assessment template copy', function () {
    it('copies tree preserving pid relationships', function () {
        [$user] = createAdminWithCompany();

        // Build a small tree for 2025
        $l1 = DailyCheckTemplate::create(['title' => '一级A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025, 'score_range' => '10']);
        $l2a = DailyCheckTemplate::create(['title' => '二级A-1', 'level' => 2, 'sort' => 1, 'pid' => $l1->id, 'year' => 2025, 'score_range' => '5']);
        $l2b = DailyCheckTemplate::create(['title' => '二级A-2', 'level' => 2, 'sort' => 2, 'pid' => $l1->id, 'year' => 2025, 'score_range' => '5']);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/assessment-templates/copy', [
                'from_year' => 2025,
                'to_year' => 2027,
                'kinds' => ['daily'],
            ]);

        $response->assertOk();
        expect($response->json('data.summary.daily.copied'))->toBe(3);

        $copiedL1 = DailyCheckTemplate::where('year', 2027)->where('pid', 0)->first();
        expect($copiedL1)->not->toBeNull()
            ->and($copiedL1->title)->toBe('一级A')
            ->and($copiedL1->id)->not->toBe($l1->id);

        $copiedChildren = DailyCheckTemplate::where('year', 2027)->where('pid', $copiedL1->id)->orderBy('sort')->get();
        expect($copiedChildren)->toHaveCount(2)
            ->and($copiedChildren[0]->title)->toBe('二级A-1')
            ->and($copiedChildren[1]->title)->toBe('二级A-2')
            ->and($copiedChildren[0]->id)->not->toBe($l2a->id)
            ->and($copiedChildren[1]->id)->not->toBe($l2b->id);
    });

    it('refuses to copy into a populated year without overwrite', function () {
        [$user] = createAdminWithCompany();

        DailyCheckTemplate::create(['title' => '旧', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);
        DailyCheckTemplate::create(['title' => '已有', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/assessment-templates/copy', [
                'from_year' => 2025,
                'to_year' => 2026,
                'kinds' => ['daily'],
            ]);

        $response->assertStatus(400);
        expect(DailyCheckTemplate::where('year', 2026)->count())->toBe(1);
    });

    it('overwrites the target year when overwrite=true', function () {
        [$user] = createAdminWithCompany();

        DailyCheckTemplate::create(['title' => '2025只有这条', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);
        DailyCheckTemplate::create(['title' => '要被覆盖', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);
        DailyCheckTemplate::create(['title' => '要被覆盖2', 'level' => 1, 'sort' => 2, 'pid' => 0, 'year' => 2026]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/assessment-templates/copy', [
                'from_year' => 2025,
                'to_year' => 2026,
                'kinds' => ['daily'],
                'overwrite' => true,
            ]);

        $response->assertOk();
        $rows = DailyCheckTemplate::where('year', 2026)->get();
        expect($rows)->toHaveCount(1)
            ->and($rows[0]->title)->toBe('2025只有这条');
    });

    it('copies across all three kinds by default', function () {
        [$user] = createAdminWithCompany();

        DailyCheckTemplate::create(['title' => 'D', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);
        AccidentCheckTemplate::create(['title' => 'A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);
        AddPointsTemplate::create(['title' => 'P', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/assessment-templates/copy', [
                'from_year' => 2025,
                'to_year' => 2027,
            ]);

        $response->assertOk();
        expect(DailyCheckTemplate::where('year', 2027)->count())->toBe(1)
            ->and(AccidentCheckTemplate::where('year', 2027)->count())->toBe(1)
            ->and(AddPointsTemplate::where('year', 2027)->count())->toBe(1);
    });

    it('years endpoint returns union across tables', function () {
        [$user] = createAdminWithCompany();

        DailyCheckTemplate::create(['title' => 'D', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2024]);
        AccidentCheckTemplate::create(['title' => 'A', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2025]);
        AddPointsTemplate::create(['title' => 'P', 'level' => 1, 'sort' => 1, 'pid' => 0, 'year' => 2026]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/assessment-templates/years');

        $response->assertOk();
        expect($response->json('data'))->toBe([2026, 2025, 2024]);
    });
});
