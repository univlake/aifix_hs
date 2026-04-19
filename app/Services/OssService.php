<?php

namespace App\Services;

use RuntimeException;

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

    /**
     * Initiate a multipart upload on OSS and return the upload ID.
     */
    public static function initMultipart(string $key): string
    {
        [$host, $bucket, $accessKeyId, $secretKey] = self::credentials();

        $date = gmdate('D, d M Y H:i:s \G\M\T');
        $contentType = 'application/octet-stream';
        $resource = "/{$bucket}/{$key}?uploads";
        $stringToSign = "POST\n\n{$contentType}\n{$date}\n{$resource}";
        $signature = base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true));

        $response = self::httpRequest('POST', "{$host}/{$key}?uploads", [
            "Date: {$date}",
            "Content-Type: {$contentType}",
            'Content-Length: 0',
            "Authorization: OSS {$accessKeyId}:{$signature}",
        ], '');

        $xml = @simplexml_load_string($response);
        if (! $xml || empty((string) $xml->UploadId)) {
            throw new RuntimeException('初始化分片上传失败：响应无效');
        }

        return (string) $xml->UploadId;
    }

    /**
     * Generate a pre-signed PUT URL for an individual multipart UploadPart request.
     */
    public static function signPartUrl(string $key, string $uploadId, int $partNumber, int $ttl = 7200): string
    {
        [$host, $bucket, $accessKeyId, $secretKey] = self::credentials();

        $expireTime = time() + $ttl;
        // Sub-resources must be alphabetically sorted in CanonicalizedResource:
        // partNumber < uploadId.
        $resource = "/{$bucket}/{$key}?partNumber={$partNumber}&uploadId={$uploadId}";
        $stringToSign = "PUT\n\n\n{$expireTime}\n{$resource}";
        $signature = urlencode(base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true)));

        return "{$host}/{$key}?partNumber={$partNumber}&uploadId={$uploadId}"
            ."&OSSAccessKeyId={$accessKeyId}&Expires={$expireTime}&Signature={$signature}";
    }

    /**
     * Complete a multipart upload by submitting the ordered part list (PartNumber + ETag).
     *
     * @param  array<int, array{PartNumber:int, ETag:string}>  $parts
     */
    public static function completeMultipart(string $key, string $uploadId, array $parts): string
    {
        [$host, $bucket, $accessKeyId, $secretKey] = self::credentials();

        usort($parts, fn ($a, $b) => (int) $a['PartNumber'] <=> (int) $b['PartNumber']);

        $xmlBody = '<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload>';
        foreach ($parts as $p) {
            $num = (int) $p['PartNumber'];
            $etag = htmlspecialchars((string) $p['ETag'], ENT_XML1);
            $xmlBody .= "<Part><PartNumber>{$num}</PartNumber><ETag>{$etag}</ETag></Part>";
        }
        $xmlBody .= '</CompleteMultipartUpload>';

        $date = gmdate('D, d M Y H:i:s \G\M\T');
        $contentType = 'application/xml';
        $contentMd5 = base64_encode(md5($xmlBody, true));
        $resource = "/{$bucket}/{$key}?uploadId={$uploadId}";
        $stringToSign = "POST\n{$contentMd5}\n{$contentType}\n{$date}\n{$resource}";
        $signature = base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true));

        self::httpRequest('POST', "{$host}/{$key}?uploadId={$uploadId}", [
            "Date: {$date}",
            "Content-Type: {$contentType}",
            "Content-MD5: {$contentMd5}",
            'Content-Length: '.strlen($xmlBody),
            "Authorization: OSS {$accessKeyId}:{$signature}",
        ], $xmlBody);

        return "{$host}/{$key}";
    }

    /**
     * Abort a multipart upload (best-effort; failures are swallowed).
     */
    public static function abortMultipart(string $key, string $uploadId): void
    {
        try {
            [$host, $bucket, $accessKeyId, $secretKey] = self::credentials();

            $date = gmdate('D, d M Y H:i:s \G\M\T');
            $resource = "/{$bucket}/{$key}?uploadId={$uploadId}";
            $stringToSign = "DELETE\n\n\n{$date}\n{$resource}";
            $signature = base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true));

            self::httpRequest('DELETE', "{$host}/{$key}?uploadId={$uploadId}", [
                "Date: {$date}",
                "Authorization: OSS {$accessKeyId}:{$signature}",
            ], '');
        } catch (\Throwable $e) {
            // Best-effort; orphan parts are auto-cleaned by OSS lifecycle rules.
        }
    }

    /**
     * @return array{0:string,1:string,2:string,3:string} [host, bucket, accessKeyId, secretKey]
     */
    private static function credentials(): array
    {
        $config = config('filesystems.disks.oss');
        $host = rtrim($config['url'] ?? '', '/');
        $bucket = $config['bucket'] ?? '';
        $accessKeyId = $config['access_key_id'] ?? '';
        $secretKey = $config['access_key_secret'] ?? '';

        if (empty($accessKeyId) || empty($secretKey) || empty($host) || empty($bucket)) {
            throw new RuntimeException('OSS 配置缺失，无法执行分片上传');
        }

        return [$host, $bucket, $accessKeyId, $secretKey];
    }

    /**
     * @param  array<int, string>  $headers
     */
    private static function httpRequest(string $method, string $url, array $headers, string $body): string
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            throw new RuntimeException("OSS 请求失败：{$err}");
        }

        if ($code < 200 || $code >= 300) {
            throw new RuntimeException("OSS 请求返回 HTTP {$code}：{$response}");
        }

        return (string) $response;
    }
}
