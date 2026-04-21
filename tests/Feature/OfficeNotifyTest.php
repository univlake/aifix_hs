<?php

use App\Models\Company;
use App\Models\OfficeNotify;
use App\Models\OfficeNotifyScope;

describe('OfficeNotify (task-based) API', function () {
    it('returns meetings where company is recipient via company_id filter', function () {
        [$user, $company] = createAdminWithCompany();
        $organizer = Company::factory()->create();

        $own = OfficeNotify::create(['company_id' => $company->id, 'name' => '本部任务']);
        $invited = OfficeNotify::create(['company_id' => $organizer->id, 'name' => '受发任务']);
        OfficeNotifyScope::create(['office_notify_id' => $invited->id, 'company_id' => $company->id]);
        OfficeNotify::create(['company_id' => $organizer->id, 'name' => '无关任务']);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/office-notifies?company_id={$company->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($own->id, $invited->id);
        expect(count($ids))->toBe(2);
    });

    it('filters by notify_company_id to recipient-only view', function () {
        [$user, $company] = createAdminWithCompany();
        $organizer = Company::factory()->create();

        $invited = OfficeNotify::create(['company_id' => $organizer->id, 'name' => '受发任务']);
        OfficeNotifyScope::create(['office_notify_id' => $invited->id, 'company_id' => $company->id]);
        OfficeNotify::create(['company_id' => $company->id, 'name' => '本部任务']);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/office-notifies?notify_company_id={$company->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toBe([$invited->id]);
    });

    it('submits feedback attachment and stamps status', function () {
        [$user, $company] = createAdminWithCompany();
        $notify = OfficeNotify::create(['company_id' => $company->id, 'name' => '反馈测试']);
        $scope = OfficeNotifyScope::create([
            'office_notify_id' => $notify->id,
            'company_id' => $company->id,
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/office-notify-scopes/{$scope->id}/feedback", [
                'feedback_annex_url' => 'https://oss.example.com/feedback.pdf',
            ]);

        $response->assertOk();
        $scope->refresh();
        expect($scope->feedback_annex_url)->toBe('https://oss.example.com/feedback.pdf')
            ->and($scope->feedback_status)->toBe('已反馈')
            ->and($scope->feedback_time)->not->toBeNull();
    });

    it('requires feedback_annex_url on submit', function () {
        [$user, $company] = createAdminWithCompany();
        $notify = OfficeNotify::create(['company_id' => $company->id, 'name' => '缺附件']);
        $scope = OfficeNotifyScope::create([
            'office_notify_id' => $notify->id,
            'company_id' => $company->id,
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/office-notify-scopes/{$scope->id}/feedback", []);

        $response->assertStatus(422);
    });

    it('returns pending task notices for dashboard', function () {
        [$user, $company] = createAdminWithCompany();
        $notify = OfficeNotify::create(['company_id' => $company->id, 'name' => '待反馈']);

        OfficeNotifyScope::create([
            'office_notify_id' => $notify->id,
            'company_id' => $company->id,
        ]);
        OfficeNotifyScope::create([
            'office_notify_id' => $notify->id,
            'company_id' => $company->id,
            'feedback_status' => '已反馈',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/office-notify-notifications/pending?company_id={$company->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
    });
});
