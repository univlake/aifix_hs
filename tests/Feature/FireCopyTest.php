<?php

use App\Models\FireEquipment;
use App\Models\FireFacility;

describe('Fire equipment / facility copy', function () {
    it('copies selected fire equipment rows', function () {
        [$user, $company] = createAdminWithCompany();
        $a = FireEquipment::create(['company_id' => $company->id, 'equipment_name' => '器材A']);
        $b = FireEquipment::create(['company_id' => $company->id, 'equipment_name' => '器材B']);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/fire-equipment/copy', ['ids' => [$a->id, $b->id]]);

        $response->assertOk()
            ->assertJsonPath('data.count', 2);
        expect(FireEquipment::where('equipment_name', '器材A')->count())->toBe(2);
        expect(FireEquipment::where('equipment_name', '器材B')->count())->toBe(2);
    });

    it('requires a non-empty ids array for fire-equipment copy', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/fire-equipment/copy', ['ids' => []]);

        $response->assertStatus(422);
    });

    it('returns 404 when all ids are unknown for fire-equipment copy', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/fire-equipment/copy', ['ids' => [999001, 999002]]);

        $response->assertStatus(404);
    });

    it('copies selected fire facility rows', function () {
        [$user, $company] = createAdminWithCompany();
        $a = FireFacility::create(['company_id' => $company->id, 'equipment_name' => '设施A']);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/fire-facilities/copy', ['ids' => [$a->id]]);

        $response->assertOk()
            ->assertJsonPath('data.count', 1);
        expect(FireFacility::where('equipment_name', '设施A')->count())->toBe(2);
    });
});
