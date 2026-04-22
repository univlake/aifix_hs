<?php

use App\Models\NormCheck;

describe('NormCheck API', function () {
    it('returns paginated list', function () {
        [$user, $company] = createAdminWithCompany();
        NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/norm-checks?company_id='.$company->id)
            ->assertOk()
            ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
    });

    it('returns detail', function () {
        [$user, $company] = createAdminWithCompany();
        $record = NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/norm-checks/{$record->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $record->id);
    });

    it('returns 404 for non-existent', function () {
        [$user] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/norm-checks/99999')
            ->assertStatus(404);
    });

    it('creates record', function () {
        [$user, $company] = createAdminWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/norm-checks', [
                'company_id' => $company->id,
                'year' => 2026,
                'type' => '消防',
            ])
            ->assertOk();
    });

    it('denies create without permission', function () {
        [$user, $company] = createUserWithCompany();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/norm-checks', [
                'company_id' => $company->id,
                'year' => 2026,
                'type' => '消防',
            ])
            ->assertStatus(403);
    });

    it('updates record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/norm-checks/{$record->id}", ['number' => 90])
            ->assertOk();
    });

    it('denies update without permission', function () {
        [$user, $company] = createUserWithCompany();
        $record = NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/norm-checks/{$record->id}", ['number' => 90])
            ->assertStatus(403);
    });

    it('deletes record', function () {
        [$user, $company] = createAdminWithCompany();
        $record = NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/norm-checks/{$record->id}")
            ->assertOk();
    });

    it('denies delete without permission', function () {
        [$user, $company] = createUserWithCompany();
        $record = NormCheck::create(['company_id' => $company->id, 'year' => 2026, 'type' => '消防']);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/norm-checks/{$record->id}")
            ->assertStatus(403);
    });
});
