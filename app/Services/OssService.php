<?php

namespace App\Services;

class OssService
{
    public static function signUrl(string $url, int $ttl = 3600): string
    {
        if (empty($url) || str_contains($url, 'OSSAccessKeyId')) {
            return $url; // already signed or empty
        }

        if (! str_starts_with($url, 'http')) {
            return $url; // relative path, return as-is
        }

        $config = config('filesystems.disks.oss');
        $accessKeyId = $config['access_key_id'] ?? '';
        $secretKey = $config['access_key_secret'] ?? '';
        $bucket = $config['bucket'] ?? '';
        $host = rtrim($config['url'] ?? '', '/');

        if (empty($accessKeyId) || empty($secretKey)) {
            return $url;
        }

        $objectKey = ltrim(parse_url($url, PHP_URL_PATH) ?? '', '/');
        if (empty($objectKey)) {
            return $url;
        }

        $expireTime = time() + $ttl;
        $stringToSign = "GET\n\n\n{$expireTime}\n/{$bucket}/{$objectKey}";
        $signature = urlencode(base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true)));

        return "{$host}/{$objectKey}?OSSAccessKeyId={$accessKeyId}&Expires={$expireTime}&Signature={$signature}";
    }
}
