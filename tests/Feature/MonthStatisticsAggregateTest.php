<?php

use App\Models\AccidentBulletin;
use App\Models\EmergencyDrill;
use App\Models\FireEquipment;
use App\Models\FireFacility;
use App\Models\InternalMeeting;
use App\Models\InternalTraining;
use App\Models\MonthlyInvestigation;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

/**
 * Characterization test for MonthStatisticsController::aggregateMonth() via /month-statistics/stuff.
 *
 * Locks down the aggregation outputs across all month-count keys before consolidating
 * the 21 separate aggregate queries down to fewer queries via CASE WHEN.
 *
 * Also asserts the query-count budget so future regressions surface immediately.
 */
describe('MonthStatistic aggregate (stuff endpoint)', function () {
    it('returns zeroed counts for a produce company with no related data', function () {
        [$user, $company] = createAdminWithCompany();
        $company->update(['is_produce' => 1, 'is_bloc' => 0]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/month-statistics/stuff?company_id='.$company->id);

        $response->assertOk();
        $data = $response->json('data');

        // average_employee falls back to Personnel.total_people (0 when no personnel row)
        expect($data['average_employee'])->toBe(0);

        // All count fields default to 0
        foreach ([
            'safety_meeting_count', 'fire_meeting_count',
            'safety_check_count', 'fire_check_count',
            'safety_funding', 'fire_funding',
            'hydrating_seedlings', 'retrofit_electrical', 'fire_extinguisher', 'smart_fire',
            'safety_training_count', 'safety_training_number', 'new_people_training_number',
            'fire_training_count', 'fire_training_number',
            'safety_emergency_count', 'safety_emergency_number',
            'fire_emergency_count', 'fire_emergency_number',
            'some_hidden_danger', 'some_rectify_hidden_danger',
            'big_hidden_danger', 'big_rectify_hidden_danger', 'govern_hidden_danger_count',
            'fire_fighting_danger', 'fire_fighting_hidden_danger', 'fire_fighting_hidden_danger_rectify',
            'accident_bulletin_count',
        ] as $key) {
            expect($data[$key])->toBe(0, "Expected {$key} to be 0");
        }

        expect($data['govern_hidden_danger'])->toBe([]);
        expect($data['accident_bulletin'])->toBe([]);
        expect($data['company_id'])->toBe((int) $company->id);
        expect($data['company_name'])->toBe((string) $company->title);
    });

    it('aggregates month counts correctly with seeded data', function () {
        [$user, $company] = createAdminWithCompany();
        $company->update(['is_produce' => 1, 'is_bloc' => 0, 'title' => 'Aggregate Test Co']);

        $year = (int) date('Y');
        $month = (int) date('m');
        $day = sprintf('%04d-%02d-15', $year, $month);

        Personnel::factory()->create(['company_id' => $company->id, 'total_people' => 42]);

        // InternalMeeting: 2 安全例会, 1 消防例会, 1 其他 (ignored)
        InternalMeeting::create(['company_id' => $company->id, 'type' => '安全例会', 'name' => 'A']);
        InternalMeeting::create(['company_id' => $company->id, 'type' => '安全例会', 'name' => 'B']);
        InternalMeeting::create(['company_id' => $company->id, 'type' => '消防例会', 'name' => 'C']);
        InternalMeeting::create(['company_id' => $company->id, 'type' => '其他', 'name' => 'D']);

        // MonthlyInvestigation on created_at: type filter (safety_check vs fire_check)
        // Uses created_at which auto-fills to current timestamp.
        MonthlyInvestigation::create(['company_id' => $company->id, 'type' => '安全', 'level' => '一般隐患', 'inv_time' => $day, 'correct_result' => '已整改']);
        MonthlyInvestigation::create(['company_id' => $company->id, 'type' => '安全', 'level' => '一般隐患', 'inv_time' => $day, 'correct_result' => '未整改']);
        MonthlyInvestigation::create(['company_id' => $company->id, 'type' => '安全', 'level' => '重大隐患', 'inv_time' => $day, 'correct_result' => '已整改', 'is_govern' => 1]);
        MonthlyInvestigation::create(['company_id' => $company->id, 'type' => '消防', 'level' => '一般隐患', 'inv_time' => $day, 'correct_result' => '已整改', 'is_fire_fighting' => 1]);
        MonthlyInvestigation::create(['company_id' => $company->id, 'type' => '消防', 'level' => '重大隐患', 'inv_time' => $day, 'correct_result' => '未整改', 'is_fire_fighting' => 1]);

        // FireEquipment grouped by special_type
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '水带苗子']);
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '水带苗子']);
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '改造电气线路']);
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '灭火器']);
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '灭火器']);
        FireEquipment::create(['company_id' => $company->id, 'special_type' => '灭火器']);

        // FireFacility 智慧消防系统
        FireFacility::create(['company_id' => $company->id, 'special_type' => '智慧消防系统']);

        // InternalTraining grouped by training_type (uses training_date)
        InternalTraining::create(['company_id' => $company->id, 'training_type' => '安全培训', 'training_date' => $day, 'number' => 10]);
        InternalTraining::create(['company_id' => $company->id, 'training_type' => '安全培训', 'training_date' => $day, 'number' => 5]);
        InternalTraining::create(['company_id' => $company->id, 'training_type' => '新员工培训', 'training_date' => $day, 'number' => 8]);
        InternalTraining::create(['company_id' => $company->id, 'training_type' => '消防培训', 'training_date' => $day, 'number' => 12]);

        // EmergencyDrill grouped by drill_type (uses drill_time)
        EmergencyDrill::create(['company_id' => $company->id, 'drill_type' => '安全生产', 'drill_time' => $day, 'drill_number' => 20]);
        EmergencyDrill::create(['company_id' => $company->id, 'drill_type' => '消防安全', 'drill_time' => $day, 'drill_number' => 30]);

        // AccidentBulletin
        AccidentBulletin::create(['company_id' => $company->id]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/month-statistics/stuff?company_id='.$company->id);

        $response->assertOk();
        $data = $response->json('data');

        expect($data['average_employee'])->toBe(42);

        // InternalMeeting type counts
        expect($data['safety_meeting_count'])->toBe(2);
        expect($data['fire_meeting_count'])->toBe(1);

        // MonthlyInvestigation by type on created_at column
        // 4 rows have type '安全' (since type='安全' includes both general/major/fire-flag), 1 type '消防'
        // Actually re-counting: 3 are type '安全' + 2 type '消防' = 5 total. safety_check = type != '消防' = 3, fire_check = type = '消防' = 2.
        expect($data['safety_check_count'])->toBe(3);
        expect($data['fire_check_count'])->toBe(2);

        // FireEquipment grouped
        expect($data['hydrating_seedlings'])->toBe(2);
        expect($data['retrofit_electrical'])->toBe(1);
        expect($data['fire_extinguisher'])->toBe(3);

        // FireFacility
        expect($data['smart_fire'])->toBe(1);

        // InternalTraining grouped
        expect($data['safety_training_count'])->toBe(2);
        expect($data['safety_training_number'])->toBe(15);
        expect($data['new_people_training_number'])->toBe(8);
        expect($data['fire_training_count'])->toBe(1);
        expect($data['fire_training_number'])->toBe(12);

        // EmergencyDrill grouped
        expect($data['safety_emergency_count'])->toBe(1);
        expect($data['safety_emergency_number'])->toBe(20);
        expect($data['fire_emergency_count'])->toBe(1);
        expect($data['fire_emergency_number'])->toBe(30);

        // MonthlyInvestigation on inv_time:
        // 一般隐患 rows: 3 (one each: 已整改/未整改/已整改+消防) — some_hidden=3, some_rectify=2
        // 重大隐患 rows: 2 (已整改+is_govern, 未整改+消防) — big_hidden=2, big_rectify=1, govern_count=1
        // type '消防' = 2 — fire_danger=2
        // is_fire_fighting=1 → 2 rows; correct_result != '未整改' → 1 row
        expect($data['some_hidden_danger'])->toBe(3);
        expect($data['some_rectify_hidden_danger'])->toBe(2);
        expect($data['big_hidden_danger'])->toBe(2);
        expect($data['big_rectify_hidden_danger'])->toBe(1);
        expect($data['govern_hidden_danger_count'])->toBe(1);
        expect($data['fire_fighting_danger'])->toBe(2);
        expect($data['fire_fighting_hidden_danger'])->toBe(2);
        expect($data['fire_fighting_hidden_danger_rectify'])->toBe(1);

        expect($data['accident_bulletin_count'])->toBe(1);
    });

    it('keeps query count under threshold for aggregateMonth', function () {
        [$user, $company] = createAdminWithCompany();
        $company->update(['is_produce' => 1, 'is_bloc' => 0]);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/month-statistics/stuff?company_id='.$company->id)
            ->assertOk();

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Filter to aggregateMonth() queries: those scanning the model tables involved.
        $aggregateTables = [
            'internal_meetings', 'monthly_investigations', 'funding_executions',
            'fire_equipment', 'fire_facilities', 'internal_trainings', 'emergency_drills',
            'accident_bulletins', 'personnel',
        ];
        $aggregateQueryCount = 0;
        foreach ($queries as $q) {
            $sql = strtolower($q['query']);
            foreach ($aggregateTables as $table) {
                if (str_contains($sql, " from `{$table}`") || str_contains($sql, " from {$table}")) {
                    $aggregateQueryCount++;
                    break;
                }
            }
        }

        // Pre-refactor baseline: ~12 aggregate queries. Post-refactor target: ≤ 12.
        // (Was ~21 before consolidating 9 same-table counts via CASE-WHEN selectRaw.)
        expect($aggregateQueryCount)->toBeLessThanOrEqual(12, "aggregateMonth issued {$aggregateQueryCount} queries; expected ≤ 12");
    });
});
