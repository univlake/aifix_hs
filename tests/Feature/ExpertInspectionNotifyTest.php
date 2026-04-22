<?php

use App\Models\Company;
use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\ExpertInspectionUser;
use App\Models\User;

describe('Expert inspection notifications', function () {
    it('companyNotifications surfaces only rows with notify_company_time <= now()', function () {
        [$user, $parent] = createAdminWithCompany();
        $check = Company::factory()->create(['pid' => $parent->id]);
        $inspection = ExpertInspection::create(['title' => '2024 专家检查', 'company_id' => $parent->id]);

        // notify_company_time in the future → hidden.
        ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $check->id,
            'company_id' => $parent->id,
            'notify_company_time' => now()->addDay(),
            'status' => 0,
        ]);
        // Null notify_company_time → hidden (treated as "not scheduled").
        ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $check->id,
            'company_id' => $parent->id,
            'status' => 0,
        ]);
        // notify_company_time in the past → visible.
        $due = ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $check->id,
            'company_id' => $parent->id,
            'notify_company_time' => now()->subHour(),
            'status' => 0,
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/expert-inspection-notifications/company?company_id={$check->id}");

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();
        expect($ids)->toBe([$due->id]);
    });

    it('companyNotifications carries the assigned experts on each card', function () {
        [$user, $parent] = createAdminWithCompany();
        $check = Company::factory()->create(['pid' => $parent->id]);
        $expert = User::factory()->create(['nickname' => '张三']);
        $inspection = ExpertInspection::create(['title' => 'x', 'company_id' => $parent->id]);
        $row = ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $check->id,
            'company_id' => $parent->id,
            'notify_company_time' => now()->subMinute(),
            'status' => 1,
        ]);
        ExpertInspectionUser::create([
            'expert_user_id' => $expert->id,
            'expert_company_id' => $row->id,
            'company_id' => $parent->id,
            'status' => 1,
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/expert-inspection-notifications/company?company_id={$check->id}");

        $response->assertOk();
        $data = $response->json('data');
        expect($data)->toHaveCount(1);
        $experts = $data[0]['expert_inspection_users'] ?? [];
        expect($experts)->toHaveCount(1)
            ->and($experts[0]['expert_user']['nickname'] ?? null)->toBe('张三');
    });

    it('expertNotifications returns every unconfirmed assignment immediately', function () {
        [$user, $parent] = createAdminWithCompany();
        $expert = User::factory()->create();
        $inspection = ExpertInspection::create(['title' => 'x', 'company_id' => $parent->id]);
        $company = ExpertCompany::create(['expert_inspection_id' => $inspection->id, 'check_company_id' => 1, 'company_id' => $parent->id, 'status' => 0]);

        $pending = ExpertInspectionUser::create(['expert_user_id' => $expert->id, 'expert_company_id' => $company->id, 'company_id' => $parent->id, 'status' => 0]);
        ExpertInspectionUser::create(['expert_user_id' => $expert->id, 'expert_company_id' => $company->id, 'company_id' => $parent->id, 'confirm_time' => now(), 'status' => 2]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/expert-inspection-notifications/expert?expert_user_id={$expert->id}");

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();
        expect($ids)->toBe([$pending->id]);
    });

    it('my-check-inspections on the company side only returns plans whose notify time has passed', function () {
        [$user, $parent] = createAdminWithCompany();
        $check = Company::factory()->create(['pid' => $parent->id]);
        $inspection = ExpertInspection::create(['title' => 'x', 'company_id' => $parent->id]);

        ExpertCompany::create(['expert_inspection_id' => $inspection->id, 'check_company_id' => $check->id, 'company_id' => $parent->id, 'notify_company_time' => now()->addDay(), 'status' => 0]);
        $visible = ExpertCompany::create(['expert_inspection_id' => $inspection->id, 'check_company_id' => $check->id, 'company_id' => $parent->id, 'notify_company_time' => now()->subMinute(), 'status' => 1]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/my-check-inspections?company_id={$check->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toBe([$visible->id]);
    });

    it('my-check-inspections unions expert-side rows immediately regardless of notify time', function () {
        [$user, $parent] = createAdminWithCompany();
        $userCompany = Company::factory()->create(['pid' => $parent->id]);
        $otherCompany = Company::factory()->create(['pid' => $parent->id]);
        $inspection = ExpertInspection::create(['title' => 'x', 'company_id' => $parent->id]);

        // Company-side row: not yet due — hidden on that side.
        ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $userCompany->id,
            'company_id' => $parent->id,
            'notify_company_time' => now()->addDay(),
        ]);
        // Expert-side row: user is assigned expert on a different company — visible immediately.
        $expertSide = ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $otherCompany->id,
            'company_id' => $parent->id,
            'notify_company_time' => null,
        ]);
        ExpertInspectionUser::create([
            'expert_user_id' => $user->id,
            'expert_company_id' => $expertSide->id,
            'company_id' => $parent->id,
        ]);
        // Unrelated row: another company, no expert assignment — hidden.
        ExpertCompany::create([
            'expert_inspection_id' => $inspection->id,
            'check_company_id' => $otherCompany->id,
            'company_id' => $parent->id,
            'notify_company_time' => now()->subHour(),
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/my-check-inspections?company_id={$userCompany->id}&expert_user_id={$user->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toBe([$expertSide->id]);
    });

    it('my-expert-assignments returns every assignment immediately', function () {
        [$user, $parent] = createAdminWithCompany();
        $expert = User::factory()->create();
        $inspection = ExpertInspection::create(['title' => 'x', 'company_id' => $parent->id]);
        $company = ExpertCompany::create(['expert_inspection_id' => $inspection->id, 'check_company_id' => 1, 'company_id' => $parent->id, 'status' => 0]);

        $a = ExpertInspectionUser::create(['expert_user_id' => $expert->id, 'expert_company_id' => $company->id, 'company_id' => $parent->id, 'status' => 0]);
        $b = ExpertInspectionUser::create(['expert_user_id' => $expert->id, 'expert_company_id' => $company->id, 'company_id' => $parent->id, 'confirm_time' => now(), 'status' => 2]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/my-expert-assignments?expert_user_id={$expert->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($a->id, $b->id);
    });
});
