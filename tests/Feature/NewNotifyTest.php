<?php

use App\Models\Company;
use App\Models\NewNotify;
use App\Models\NewNotifyScope;

describe('NewNotify (notification-based) API', function () {
    it('returns notifies where company is recipient via company_id filter', function () {
        [$user, $company] = createAdminWithCompany();
        $organizer = Company::factory()->create();

        $own = NewNotify::create(['company_id' => $company->id, 'name' => '本部通知']);
        $invited = NewNotify::create(['company_id' => $organizer->id, 'name' => '受发通知']);
        NewNotifyScope::create(['new_notify_id' => $invited->id, 'company_id' => $company->id]);
        NewNotify::create(['company_id' => $organizer->id, 'name' => '无关通知']);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/new-notifies?company_id={$company->id}");

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();
        expect($ids)->toContain($own->id, $invited->id);
        expect(count($ids))->toBe(2);
    });

    it('marks scope as read', function () {
        [$user, $company] = createAdminWithCompany();
        $notify = NewNotify::create(['company_id' => $company->id, 'name' => '已读测试']);
        $scope = NewNotifyScope::create([
            'new_notify_id' => $notify->id,
            'company_id' => $company->id,
        ]);

        $response = $this->actingAs($user, 'api')
            ->postJson("/api/v1/new-notify-scopes/{$scope->id}/read");

        $response->assertOk();
        $scope->refresh();
        expect($scope->read_status)->toBe('已读')
            ->and($scope->read_time)->not->toBeNull();
    });

    it('returns 404 for unknown scope', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/new-notify-scopes/99999/read');

        $response->assertStatus(404);
    });

    it('returns pending notification notices for dashboard', function () {
        [$user, $company] = createAdminWithCompany();
        $notify = NewNotify::create(['company_id' => $company->id, 'name' => '待阅读']);

        NewNotifyScope::create([
            'new_notify_id' => $notify->id,
            'company_id' => $company->id,
        ]);
        NewNotifyScope::create([
            'new_notify_id' => $notify->id,
            'company_id' => $company->id,
            'read_status' => '已读',
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/new-notify-notifications/pending?company_id={$company->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
    });
});
