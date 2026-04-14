<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadOssController extends Controller
{
    public function getSignature(Request $request): JsonResponse
    {
        $dir = $request->input('dir', 'uploads/');
        $config = config('filesystems.disks.oss');

        $id = $config['access_key_id'];
        $key = $config['access_key_secret'];
        $host = $config['url'];

        $now = time();
        $expire = 3600;
        $end = $now + $expire;
        $expiration = $this->gmtIso8601($end);

        $conditions = [
            ['content-length-range', 0, 1024 * 1024 * 2048],
            ['starts-with', '$key', $dir],
        ];

        $policy = base64_encode(json_encode([
            'expiration' => $expiration,
            'conditions' => $conditions,
        ]));

        $signature = base64_encode(hash_hmac('sha1', $policy, $key, true));

        return $this->success([
            'access_key_id' => $id,
            'host' => $host,
            'policy' => $policy,
            'signature' => $signature,
            'expire' => $end,
            'dir' => $dir,
        ]);
    }

    public function callback(Request $request): JsonResponse
    {
        $authorizationBase64 = $request->server('HTTP_AUTHORIZATION', '');
        $pubKeyUrlBase64 = $request->server('HTTP_X_OSS_PUB_KEY_URL', '');

        if (empty($authorizationBase64) || empty($pubKeyUrlBase64)) {
            return $this->failed('无效的回调请求', 400);
        }

        $pubKeyUrl = base64_decode($pubKeyUrlBase64);
        $pubKey = @file_get_contents($pubKeyUrl);

        if (empty($pubKey)) {
            return $this->failed('获取公钥失败', 400);
        }

        $authorization = base64_decode($authorizationBase64);
        $body = file_get_contents('php://input');
        $path = $request->getPathInfo();
        $authStr = urldecode($path) . "\n" . $body;

        $status = openssl_verify($authStr, $authorization, $pubKey, OPENSSL_ALGO_MD5);

        if ($status === 1) {
            $data = $request->all();
            return $this->success([
                'file_url' => $data['filename'] ?? '',
            ]);
        }

        return $this->failed('签名验证失败', 403);
    }

    private function gmtIso8601(int $time): string
    {
        return str_replace('+00:00', '.000Z', gmdate('c', $time));
    }
}
