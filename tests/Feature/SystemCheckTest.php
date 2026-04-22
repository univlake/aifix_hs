<?php

use App\Models\SystemCheck;

describe('SystemCheck API', function () {
    it('returns paginated list', function () {
        [$user, $company] = createAdminWithCompany();
        SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/system-checks?company_id='.$company->id)
            ->assertOk()
            ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
    });

    it('returns detail', function () {
        [$user, $company] = createAdminWithCompany();
        $record = SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/system-checks/{$record->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $record->id);
    });

    it('returns 404 for non-existent', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/system-checks/99999')
            ->assertStatus(404);
    });

    it('creates record', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/system-checks', [
                'company_id' => $company->id,
                'year' => 2026,
            ])
            ->assertOk();
    });

    it('denies create without permission', function () {
        [$user, $company] = createUserWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/system-checks', [
                'company_id' => $company->id,
                'year' => 2026,
            ])
            ->assertStatus(403);
    });

    it('updates record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/system-checks/{$record->id}", ['number_v1' => 80])
            ->assertOk();
    });

    it('denies update without permission', function () {
        [$user, $company] = createUserWithCompany();
        $record = SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/system-checks/{$record->id}", ['number_v1' => 80])
            ->assertStatus(403);
    });

    it('deletes record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/system-checks/{$record->id}")
            ->assertOk();
    });

    it('denies delete without permission', function () {
        [$user, $company] = createUserWithCompany();
        $record = SystemCheck::create(['company_id' => $company->id, 'year' => 2026]);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/system-checks/{$record->id}")
            ->assertStatus(403);
    });
});
