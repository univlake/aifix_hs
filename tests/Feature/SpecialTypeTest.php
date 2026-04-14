<?php

use App\Models\SpecialType;

describe('SpecialType API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user] = createAdminWithCompany();
            SpecialType::create(['title' => '设备类型A']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/special-types');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-types', ['title' => '新设备类型']);

            $response->assertOk();
        });

        it('denies create without permission', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-types', ['title' => '越权']);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/special-types', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user] = createAdminWithCompany();
            $record = SpecialType::create(['title' => '旧标题']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/special-types/{$record->id}", ['title' => '新标题']);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user] = createUserWithCompany();
            $record = SpecialType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/special-types/{$record->id}", ['title' => '越权']);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user] = createAdminWithCompany();
            $record = SpecialType::create(['title' => '待删除']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/special-types/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user] = createUserWithCompany();
            $record = SpecialType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/special-types/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
