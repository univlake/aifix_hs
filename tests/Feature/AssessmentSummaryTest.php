<?php

use App\Models\AccidentCheck;
use App\Models\AddPoint;
use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\NormCheck;
use App\Models\SystemCheck;

describe('Assessment summary', function () {
    it('computes per-subordinate scores in bloc mode', function () {
        [$user, $parent] = createAdminWithCompany();
        $subA = Company::factory()->create(['pid' => $parent->id]);
        $subB = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;

        // subA: daily 30, norm 80 -> 16, accident扣8 -> 12, points 2, system 6 ⇒ 66
        DailyCheck::create(['daily_check_template_id' => 1, 'company_id' => $subA->id, 'year' => $year, 'number' => 30]);
        NormCheck::create(['company_id' => $subA->id, 'year' => $year, 'type' => '危化', 'number' => 80]);
        AccidentCheck::create(['accident_check_template_id' => 1, 'company_id' => $subA->id, 'year' => $year, 'number' => 8]);
        AddPoint::create(['add_points_template_id' => 1, 'company_id' => $subA->id, 'year' => $year, 'number' => 2]);
        SystemCheck::create(['company_id' => $subA->id, 'year' => $year, 'number' => 6]);

        // subB: only daily 10
        DailyCheck::create(['daily_check_template_id' => 1, 'company_id' => $subB->id, 'year' => $year, 'number' => 10]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/assessment-summary?company_id={$parent->id}&year={$year}&type=bloc");
        $response->assertOk();

        $data = collect($response->json('data'))->keyBy('company_id');
        expect($data->count())->toBe(2);

        $a = $data->get($subA->id);
        expect((float) $a['number1'])->toBe(30.0)
            ->and((float) $a['number2'])->toBe(16.0)
            ->and((float) $a['number4'])->toBe(6.0)
            ->and((float) $a['number5'])->toBe(12.0)
            ->and((float) $a['number6'])->toBe(2.0)
            ->and((float) $a['number'])->toBe(66.0)
            ->and($a['type'])->toBe('危化');

        $b = $data->get($subB->id);
        expect((float) $b['number1'])->toBe(10.0)
            ->and((float) $b['number'])->toBe(10.0)
            ->and($b['type'])->toBe('暂无');
    });

    it('computes company mode for a single enterprise', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        DailyCheck::create(['daily_check_template_id' => 1, 'company_id' => $company->id, 'year' => $year, 'number' => 25]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/assessment-summary?company_id={$company->id}&year={$year}&type=company");
        $response->assertOk();
        expect($response->json('data.company_id'))->toBe($company->id)
            ->and((float) $response->json('data.number1'))->toBe(25.0)
            ->and((float) $response->json('data.number'))->toBe(25.0);
    });

    it('norm uses scale 30 when year > 2025', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2026;
        NormCheck::create(['company_id' => $company->id, 'year' => $year, 'type' => '造纸', 'number' => 90]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/assessment-summary?company_id={$company->id}&year={$year}&type=company");
        $response->assertOk();
        expect((float) $response->json('data.number2'))->toBe(27.0); // 90/100 * 30
    });

    it('exports single company as Word document', function () {
        [$user, $company] = createAdminWithCompany();
        $year = 2024;
        DailyCheck::create(['daily_check_template_id' => 1, 'company_id' => $company->id, 'year' => $year, 'number' => 40]);

        $response = $this->actingAs($user, 'api')
            ->get("/api/v1/assessment-summary/export?company_id={$company->id}&year={$year}&type=company");
        $response->assertOk();
        expect($response->headers->get('Content-Type'))
            ->toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        expect($response->headers->get('Content-Disposition'))->toContain('.docx');
    });

    it('exports bloc aggregate as Word document', function () {
        [$user, $parent] = createAdminWithCompany();
        $sub = Company::factory()->create(['pid' => $parent->id]);
        $year = 2024;
        DailyCheck::create(['daily_check_template_id' => 1, 'company_id' => $sub->id, 'year' => $year, 'number' => 15]);

        $response = $this->actingAs($user, 'api')
            ->get("/api/v1/assessment-summary/export?company_id={$parent->id}&year={$year}&type=bloc");
        $response->assertOk();
        expect($response->headers->get('Content-Type'))
            ->toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
});
