<?php

use App\Services\OssService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('OssService::signUrl', function () {
    beforeEach(function () {
        config()->set('filesystems.disks.oss', [
            'access_key_id' => 'AKID',
            'access_key_secret' => 'SECRET',
            'bucket' => 'test-bucket',
            'url' => 'https://test-bucket.oss-cn-beijing.aliyuncs.com',
        ]);
    });

    it('returns an OSS-signed URL with no content-disposition by default', function () {
        $signed = OssService::signUrl('https://test-bucket.oss-cn-beijing.aliyuncs.com/uploads/a.pdf');
        expect($signed)
            ->toContain('OSSAccessKeyId=AKID')
            ->toContain('Expires=')
            ->toContain('Signature=')
            ->not->toContain('response-content-disposition');
    });

    it('includes response-content-disposition when forceDownload=true', function () {
        $signed = OssService::signUrl(
            'https://test-bucket.oss-cn-beijing.aliyuncs.com/uploads/a.pdf',
            3600,
            true,
            '报告.pdf',
        );

        expect($signed)->toContain('response-content-disposition=');

        parse_str(parse_url($signed, PHP_URL_QUERY), $q);
        // OSS decodes the query once → still holds RFC 5987 portion with Chinese filename.
        expect($q['response-content-disposition'])
            ->toContain('attachment')
            ->toContain("filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf");
    });
});

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
