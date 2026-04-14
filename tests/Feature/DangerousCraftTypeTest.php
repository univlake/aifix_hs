<?php

use App\Models\DangerousCraftType;

describe('DangerousCraftType API', function () {
    describe('Index (List)', function () {
        it('returns paginated list', function () {
            [$user] = createAdminWithCompany();
            DangerousCraftType::create(['title' => '硝化工艺']);

            $response = $this->actingAs($user, 'api')
                ->getJson('/api/v1/dangerous-craft-types');

            $response->assertOk()
                ->assertJsonStructure(['status', 'data' => ['data' => [['id']]]]);
        });
    });

    describe('Store (Create)', function () {
        it('creates record', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/dangerous-craft-types', [
                    'title' => '氯化工艺',
                ]);

            $response->assertOk()
                ->assertJsonPath('data.title', '氯化工艺');

            $this->assertDatabaseHas('dangerous_craft_types', ['title' => '氯化工艺']);
        });

        it('denies create without permission', function () {
            [$user] = createUserWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/dangerous-craft-types', [
                    'title' => '越权创建',
                ]);

            $response->assertStatus(403);
        });

        it('validates required fields', function () {
            [$user] = createAdminWithCompany();

            $response = $this->actingAs($user, 'api')
                ->postJson('/api/v1/dangerous-craft-types', []);

            $response->assertStatus(422);
        });
    });

    describe('Update', function () {
        it('updates record', function () {
            [$user] = createAdminWithCompany();
            $record = DangerousCraftType::create(['title' => '旧标题']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/dangerous-craft-types/{$record->id}", [
                    'title' => '新标题',
                ]);

            $response->assertOk();
        });

        it('denies update without permission', function () {
            [$user] = createUserWithCompany();
            $record = DangerousCraftType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->putJson("/api/v1/dangerous-craft-types/{$record->id}", [
                    'title' => '越权',
                ]);

            $response->assertStatus(403);
        });
    });

    describe('Delete', function () {
        it('deletes record', function () {
            [$user] = createAdminWithCompany();
            $record = DangerousCraftType::create(['title' => '待删除']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/dangerous-craft-types/{$record->id}");

            $response->assertOk();
        });

        it('denies delete without permission', function () {
            [$user] = createUserWithCompany();
            $record = DangerousCraftType::create(['title' => '测试']);

            $response = $this->actingAs($user, 'api')
                ->deleteJson("/api/v1/dangerous-craft-types/{$record->id}");

            $response->assertStatus(403);
        });
    });
});
