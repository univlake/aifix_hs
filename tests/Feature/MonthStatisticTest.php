<?php

use App\Models\MonthStatistic;
use App\Models\MonthStatisticAccident;
use App\Models\MonthStatisticControl;

describe('MonthStatistic API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user, $company] = createAdminWithCompany();
            MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/month-statistics?company_id='.$company->id);

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Show (Detail)', function () {
        it('returns detail', function () {
            [$user, $company] = createAdminWithCompany();
            $record = MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->getJson("/api/v1/month-statistics/{$record->id}");

            $response->assertOk()
                ->assertJsonPath('data.id', $record->id);
        });

        it('returns 404 for non-existent', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/month-statistics/99999');

            $response->assertStatus(404);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user, $company] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/month-statistics', [
                    'company_id' => $company->id,
                ]);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user, $company] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/month-statistics', [
                    'company_id' => $company->id,
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/month-statistics', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/month-statistics/{$record->id}", ['comment' => '月度统计']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/month-statistics/{$record->id}", ['comment' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Bulk children (govern + accident)', function () {
        it('bulk-inserts govern_hidden_danger and accident_bulletin children on create', function () {
            [$user, $company] = createAdminWithCompany();

            $payload = [
                'company_id' => $company->id,
                'govern_hidden_danger' => [
                    ['govern_title' => '隐患整改 A', 'govern_money' => '1000'],
                    ['govern_title' => '隐患整改 B', 'govern_money' => '2000'],
                    ['govern_title' => '隐患整改 C', 'govern_money' => '3000'],
                ],
                'accident_bulletin' => [
                    ['name' => '张三', 'department' => '车间一'],
                    ['name' => '李四', 'department' => '车间二'],
                ],
            ];

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/month-statistics', $payload);

            $response->assertOk();
            $statisticId = $response->json('data.id');

            $govern = MonthStatisticControl::where('month_statistic_id', $statisticId)->orderBy('id')->get();
            expect($govern)->toHaveCount(3);
            expect($govern->pluck('govern_title')->toArray())->toBe(['隐患整改 A', '隐患整改 B', '隐患整改 C']);
            expect($govern->first()->company_id)->toBe($company->id);
            expect($govern->first()->created_at)->not->toBeNull();
            expect($govern->first()->updated_at)->not->toBeNull();

            $accident = MonthStatisticAccident::where('month_statistic_id', $statisticId)->orderBy('id')->get();
            expect($accident)->toHaveCount(2);
            expect($accident->pluck('name')->toArray())->toBe(['张三', '李四']);
        });

        it('replaces children on update when provided, leaves them alone when omitted', function () {
            [$user, $company] = createAdminWithCompany();
            $statistic = MonthStatistic::create(['company_id' => $company->id]);
            MonthStatisticControl::create([
                'month_statistic_id' => $statistic->id,
                'company_id' => $company->id,
                'govern_title' => '原有隐患',
            ]);

            // Update with new govern items → existing wiped, new inserted.
            $this->actingAs($user, 'api')
                ->putJson("/api/v1/month-statistics/{$statistic->id}", [
                    'govern_hidden_danger' => [
                        ['govern_title' => '新隐患 1'],
                        ['govern_title' => '新隐患 2'],
                    ],
                ])
                ->assertOk();

            $govern = MonthStatisticControl::where('month_statistic_id', $statistic->id)->orderBy('id')->get();
            expect($govern->pluck('govern_title')->toArray())->toBe(['新隐患 1', '新隐患 2']);

            // Update without children key → existing left alone.
            $this->actingAs($user, 'api')
                ->putJson("/api/v1/month-statistics/{$statistic->id}", ['comment' => '备注更新'])
                ->assertOk();

            $govern = MonthStatisticControl::where('month_statistic_id', $statistic->id)->orderBy('id')->get();
            expect($govern->pluck('govern_title')->toArray())->toBe(['新隐患 1', '新隐患 2']);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user, $company] = createAdminWithCompany();
            $record = MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/month-statistics/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user, $company] = createUserWithCompany();
            $record = MonthStatistic::create(['company_id' => $company->id]);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/month-statistics/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
