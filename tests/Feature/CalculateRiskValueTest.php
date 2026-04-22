<?php

use App\Console\Commands\CalculateCompanyRisk;
use App\Models\Company;
use App\Models\FloatRiskLog;
use App\Models\InherentRiskLog;
use App\Models\RiskLog;

/**
 * Characterization test for App\Traits\CalculateRiskValue.
 *
 * Locks down the public outputs (risk_logs / inherent_risk_logs / float_risk_logs
 * + Company.inherent_risk / float_risk fields) so changes to the trait can be
 * validated as behavior-preserving.
 */
describe('CalculateRiskValue trait via risk:calculate command', function () {
    it('produces deterministic logs for a brand-new produce company with null prior risk values', function () {
        $company = Company::factory()->create([
            'title' => 'Char-Test Produce Co',
            'enterprise_type_id' => null,
            'is_produce' => 1,
            'is_bloc' => 0,
            'status' => 1,
            // Brand-new company: prior risk fields are null. Trait must accept null
            // (post-fix, risk_logs.old_risk_num is nullable to match Company schema).
            'inherent_risk' => null,
            'float_risk' => null,
            'inherent_risk_grade' => '',
            'float_risk_grade' => '',
        ]);

        (new CalculateCompanyRisk)->countRisk('characterization-test');

        // ── risk_logs: 2 rows (type 1 inherent, type 2 float) ────────────────
        $logs = RiskLog::where('company_id', $company->id)
            ->where('content', 'characterization-test')
            ->orderBy('type')
            ->get();
        expect($logs)->toHaveCount(2);

        // Inherent: only `major_hazard_scale = 0.0198135` fires (default match arm),
        // weights = 1.0 (enterprise_type_id null → default), risk_num = round(0.0198135 * 100, 2) = 1.98
        expect((float) $logs[0]->risk_num)->toBe(1.98);
        expect($logs[0]->type)->toBe(1);
        expect($logs[0]->risk_grade)->toBe('红');

        // Float: `accident_bulletin_severe_scale = 0.058859415` (default match arm) +
        // `risk_source_scale = 0`, risk_num = round(0.058859415 * 100, 2) = 5.89
        expect((float) $logs[1]->risk_num)->toBe(5.89);
        expect($logs[1]->type)->toBe(2);
        expect($logs[1]->risk_grade)->toBe('橙');

        // ── inherent_risk_logs: 1 row, only major_hazard_scale set ───────────
        $inherent = InherentRiskLog::where('company_id', $company->id)->get();
        expect($inherent)->toHaveCount(1);
        expect((float) $inherent[0]->major_hazard_scale)->toEqualWithDelta(0.0198135, 0.0000001);

        // ── float_risk_logs: 1 row with the two non-zero defaults ────────────
        $float = FloatRiskLog::where('company_id', $company->id)->get();
        expect($float)->toHaveCount(1);
        expect((float) $float[0]->accident_bulletin_severe_scale)->toEqualWithDelta(0.058859415, 0.0000001);
        expect((float) $float[0]->risk_source_scale)->toBe(0.0);

        // ── Company columns updated in place ─────────────────────────────────
        $company->refresh();
        expect((float) $company->inherent_risk)->toBe(1.98);
        expect((float) $company->float_risk)->toBe(5.89);
        expect($company->inherent_risk_grade)->toBe('红');
        expect($company->float_risk_grade)->toBe('橙');
    });

    it('skips companies that are not produce companies', function () {
        Company::factory()->create([
            'title' => 'Non-Produce Co',
            'is_produce' => 0,
            'status' => 1,
        ]);

        $this->artisan('risk:calculate', ['--content' => 'characterization-test'])
            ->assertExitCode(0);

        expect(RiskLog::where('content', 'characterization-test')->count())->toBe(0);
        expect(InherentRiskLog::count())->toBe(0);
        expect(FloatRiskLog::count())->toBe(0);
    });

    it('skips disabled produce companies', function () {
        Company::factory()->create([
            'title' => 'Disabled Produce Co',
            'is_produce' => 1,
            'status' => 0,
        ]);

        $this->artisan('risk:calculate', ['--content' => 'characterization-test'])
            ->assertExitCode(0);

        expect(RiskLog::where('content', 'characterization-test')->count())->toBe(0);
    });

    it('averages subordinate produce-company risk into a parent bloc company', function () {
        // Bloc with 2 subordinate produce companies that already have risk values.
        $bloc = Company::factory()->create([
            'title' => 'Bloc HQ',
            'is_bloc' => 1,
            'is_produce' => 0,
            'status' => 1,
            'pid' => 0,
        ]);

        Company::factory()->create([
            'title' => 'Sub A',
            'pid' => $bloc->id,
            'is_produce' => 1,
            'status' => 1,
            'inherent_risk' => 6.0,
            'float_risk' => 8.0,
            'inherent_risk_grade' => '橙',
            'float_risk_grade' => '橙',
        ]);

        Company::factory()->create([
            'title' => 'Sub B',
            'pid' => $bloc->id,
            'is_produce' => 1,
            'status' => 1,
            'inherent_risk' => 4.0,
            'float_risk' => 12.0,
            'inherent_risk_grade' => '红',
            'float_risk_grade' => '黄',
        ]);

        (new CalculateCompanyRisk)->countRisk('bloc-test');

        $bloc->refresh();
        // Phase 4 averages the 2 subs (subs themselves are recomputed to ~1.98/5.89 in Phase 2/3 first).
        // After Phase 2/3 reset their risk to 1.98 / 5.89 (empty data), Phase 4 averages 1.98/5.89 → bloc gets 1.98/5.89.
        expect((float) $bloc->inherent_risk)->toBe(1.98);
        expect((float) $bloc->float_risk)->toBe(5.89);

        // Bloc gets 2 risk_logs (type 1 + type 2)
        $blocLogs = RiskLog::where('company_id', $bloc->id)->where('content', 'bloc-test')->get();
        expect($blocLogs)->toHaveCount(2);
    });

    it('does not write a risk_log row for a bloc company that has no produce descendants', function () {
        $bloc = Company::factory()->create([
            'title' => 'Empty Bloc',
            'is_bloc' => 1,
            'is_produce' => 0,
            'status' => 1,
            'pid' => 0,
        ]);

        (new CalculateCompanyRisk)->countRisk('empty-bloc-test');

        expect(RiskLog::where('company_id', $bloc->id)->count())->toBe(0);
    });

    it('still computes downstream phases when run twice on the same day (today\'s logs are reset)', function () {
        $company = Company::factory()->create([
            'title' => 'Double-Run Co',
            'is_produce' => 1,
            'status' => 1,
            'inherent_risk' => null,
            'float_risk' => null,
            'inherent_risk_grade' => '',
            'float_risk_grade' => '',
        ]);

        $cmd = new CalculateCompanyRisk;
        $cmd->countRisk('first-run');
        $cmd->countRisk('second-run');

        // First run's logs were deleted at the top of the second run (whereDate).
        expect(RiskLog::where('content', 'first-run')->count())->toBe(0);
        expect(RiskLog::where('content', 'second-run')->count())->toBe(2);
        expect(InherentRiskLog::where('company_id', $company->id)->count())->toBe(1);
        expect(FloatRiskLog::where('company_id', $company->id)->count())->toBe(1);
    });
});
