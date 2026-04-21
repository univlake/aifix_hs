<?php

use App\Models\Company;
use App\Models\MonthStatistic;
use App\Models\YearStatistic;

describe('Statistics reporting', function () {
    it('month: rejects a second submission in the same month', function () {
        [$user, $company] = createAdminWithCompany();

        MonthStatistic::create([
            'company_id' => $company->id,
            'average_employee' => 10,
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/month-statistics', [
                'company_id' => $company->id,
                'average_employee' => 20,
            ]);

        $response->assertStatus(400);
        expect($response->json('message'))->toContain('当月月报');
    });

    it('month: allows update of existing record', function () {
        [$user, $company] = createAdminWithCompany();
        $row = MonthStatistic::create([
            'company_id' => $company->id,
            'average_employee' => 10,
        ]);

        $response = $this->actingAs($user, 'api')
            ->putJson("/api/v1/month-statistics/{$row->id}", [
                'average_employee' => 42,
            ]);

        $response->assertOk();
        expect($row->fresh()->average_employee)->toBe(42);
    });

    it('month: pid filter returns subordinates only', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $subB = Company::factory()->create(['pid' => $parent->id]);
        $outsider = Company::factory()->create();

        $subARow = MonthStatistic::create(['company_id' => $subA->id, 'average_employee' => 1]);
        $subBRow = MonthStatistic::create(['company_id' => $subB->id, 'average_employee' => 2]);
        $outsiderRow = MonthStatistic::create(['company_id' => $outsider->id, 'average_employee' => 9]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/month-statistics?pid={$parent->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($subARow->id, $subBRow->id)
            ->and($ids)->not->toContain($outsiderRow->id);
    });

    it('year: rejects a second submission in the same year', function () {
        [$user, $company] = createAdminWithCompany();

        YearStatistic::create([
            'company_id' => $company->id,
            'company_name' => $company->title,
            'safety_funding' => '1000',
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/year-statistics', [
                'company_id' => $company->id,
                'company_name' => $company->title,
                'safety_funding' => '2000',
            ]);

        $response->assertStatus(400);
        expect($response->json('message'))->toContain('当年年报');
    });

    it('month: stuff endpoint returns pre-fill payload for the given company', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/month-statistics/stuff?company_id={$company->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'company_id',
                    'company_name',
                    'average_employee',
                    'safety_check_count',
                    'accident_bulletin_count',
                    'govern_hidden_danger',
                    'accident_bulletin',
                ],
            ]);
        expect($response->json('data.company_id'))->toBe($company->id);
    });

    it('year: stuff endpoint returns pre-fill payload for the given company', function () {
        [$user, $company] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/year-statistics/stuff?company_id={$company->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'company_id',
                    'company_name',
                    'safety_funding',
                    'fire_fighting',
                    'kids',
                ],
            ]);
        expect($response->json('data.company_id'))->toBe($company->id);
    });

    it('month: include_pid adds parent itself to subordinate list', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);

        $parentRow = MonthStatistic::create(['company_id' => $parent->id, 'average_employee' => 5]);
        $subRow = MonthStatistic::create(['company_id' => $sub->id, 'average_employee' => 7]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/month-statistics?pid={$parent->id}&include_pid=1");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($parentRow->id, $subRow->id);
    });

    it('month: statistics sums subordinate metrics for the given month', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $subB = Company::factory()->create(['pid' => $parent->id]);
        $outsider = Company::factory()->create();

        MonthStatistic::create(['company_id' => $subA->id, 'average_employee' => 10, 'safety_check_count' => 3]);
        MonthStatistic::create(['company_id' => $subB->id, 'average_employee' => 20, 'safety_check_count' => 7]);
        MonthStatistic::create(['company_id' => $outsider->id, 'average_employee' => 99, 'safety_check_count' => 99]);

        $thisMonth = date('Y-m');
        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/month-statistics/statistics?company_id={$parent->id}&date_time={$thisMonth}");

        $response->assertOk();
        expect($response->json('data.average_employee'))->toBe(30)
            ->and($response->json('data.safety_check_count'))->toBe(10)
            ->and($response->json('data.count_number'))->toBe(2)
            ->and($response->json('data.subordinate_count'))->toBe(2)
            ->and($response->json('data.date'))->toBe($thisMonth);
    });

    it('year: statistics sums funding and groups cert kids by name', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $subB = Company::factory()->create(['pid' => $parent->id]);

        $ya = YearStatistic::create([
            'company_id' => $subA->id,
            'company_name' => $subA->title,
            'safety_funding' => '1000',
            'fire_fighting' => '500',
        ]);
        $yb = YearStatistic::create([
            'company_id' => $subB->id,
            'company_name' => $subB->title,
            'safety_funding' => '2000',
            'fire_fighting' => '300',
        ]);
        $ya->yearStatisticKid()->create([
            'name' => '注册安全工程师', 'type' => 1, 'should_obtain_people' => 5,
            'already_obtain_people' => 3, 'train_people' => 1, 'company_id' => $subA->id,
        ]);
        $yb->yearStatisticKid()->create([
            'name' => '注册安全工程师', 'type' => 1, 'should_obtain_people' => 7,
            'already_obtain_people' => 6, 'train_people' => 2, 'company_id' => $subB->id,
        ]);

        $year = date('Y');
        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/year-statistics/statistics?company_id={$parent->id}&date_time={$year}");

        $response->assertOk();
        expect($response->json('data.safety_funding'))->toBe(3000)
            ->and($response->json('data.fire_fighting'))->toBe(800)
            ->and($response->json('data.count_number'))->toBe(2)
            ->and($response->json('data.subordinate_count'))->toBe(2)
            ->and($response->json('data.date'))->toBe((string) $year);

        $sl = $response->json('data.sl_data');
        expect($sl)->toHaveCount(1);
        expect($sl[0]['name'])->toBe('注册安全工程师')
            ->and($sl[0]['should_obtain_people'])->toBe(12)
            ->and($sl[0]['already_obtain_people'])->toBe(9)
            ->and($sl[0]['train_people'])->toBe(3);
    });

    it('year: pid filter returns subordinates only', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $outsider = Company::factory()->create();

        $subARow = YearStatistic::create([
            'company_id' => $subA->id,
            'company_name' => $subA->title,
            'safety_funding' => '1',
        ]);
        $outsiderRow = YearStatistic::create([
            'company_id' => $outsider->id,
            'company_name' => $outsider->title,
            'safety_funding' => '1',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/year-statistics?pid={$parent->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($subARow->id)
            ->and($ids)->not->toContain($outsiderRow->id);
    });
});
