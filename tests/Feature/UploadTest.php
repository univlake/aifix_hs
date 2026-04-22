<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('POST /api/v1/upload', function () {
    it('stores an uploaded file and returns metadata', function () {
        Storage::fake('public');
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/upload', [
                'file' => UploadedFile::fake()->create('doc.pdf', 100),
                'dir' => 'uploads/test',
            ]);

        $response->assertOk()
            ->assertJsonStructure(['status', 'data' => ['filename', 'filepath', 'url', 'contenttype', 'filesize']]);

        Storage::disk('public')->assertExists($response->json('data.filepath'));
    });

    it('rejects requests without a file', function () {
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')->postJson('/api/v1/upload', []);

        $response->assertStatus(422);
    });

    it('rejects files over 10 MB', function () {
        Storage::fake('public');
        [$user] = createAdminWithCompany();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/upload', [
                'file' => UploadedFile::fake()->create('huge.bin', 10 * 1024 + 1),
            ]);

        $response->assertStatus(422);
    });
});
