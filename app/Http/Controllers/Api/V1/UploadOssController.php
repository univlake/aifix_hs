<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Services\OssService;
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
        $authStr = urldecode($path)."\n".$body;

        $status = openssl_verify($authStr, $authorization, $pubKey, OPENSSL_ALGO_MD5);

        if ($status === 1) {
            $data = $request->all();

            return $this->success([
                'file_url' => $data['filename'] ?? '',
            ]);
        }

        return $this->failed('签名验证失败', 403);
    }

    public function signedUrl(Request $request): JsonResponse
    {
        $url = $request->get('url', '');
        $forceDownload = $request->boolean('download');
        $filename = $request->get('filename') ?: null;

        return $this->success(OssService::signUrl($url, 3600, $forceDownload, $filename));
    }

    public function multipartInit(Request $request): JsonResponse
    {
        $request->validate([
            'filename' => 'required|string|max:255',
            'dir' => 'nullable|string|max:255',
        ]);

        $dir = rtrim($request->input('dir') ?: 'videos/'.date('Y/m').'/', '/').'/';
        $ext = pathinfo($request->input('filename'), PATHINFO_EXTENSION) ?: 'bin';
        $ext = preg_replace('/[^a-zA-Z0-9]/', '', $ext) ?: 'bin';
        $key = $dir.date('YmdHis').'_'.bin2hex(random_bytes(4)).'.'.$ext;

        try {
            $uploadId = OssService::initMultipart($key);
        } catch (\Throwable $e) {
            return $this->failed($e->getMessage(), 500);
        }

        $host = rtrim((string) config('filesystems.disks.oss.url'), '/');

        return $this->success([
            'upload_id' => $uploadId,
            'key' => $key,
            'file_url' => "{$host}/{$key}",
        ]);
    }

    public function multipartSignPart(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'upload_id' => 'required|string',
            'part_number' => 'required|integer|min:1|max:10000',
        ]);

        $url = OssService::signPartUrl(
            $request->input('key'),
            $request->input('upload_id'),
            (int) $request->input('part_number'),
        );

        return $this->success(['url' => $url]);
    }

    public function multipartComplete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => 'required|string',
            'upload_id' => 'required|string',
            'parts' => 'required|array|min:1',
            'parts.*.PartNumber' => 'required|integer|min:1',
            'parts.*.ETag' => 'required|string',
        ]);

        try {
            $fileUrl = OssService::completeMultipart($data['key'], $data['upload_id'], $data['parts']);
        } catch (\Throwable $e) {
            return $this->failed($e->getMessage(), 500);
        }

        return $this->success(['file_url' => $fileUrl]);
    }

    public function multipartAbort(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'upload_id' => 'required|string',
        ]);

        OssService::abortMultipart($request->input('key'), $request->input('upload_id'));

        return $this->message('已取消');
    }

    private function gmtIso8601(int $time): string
    {
        return str_replace('+00:00', '.000Z', gmdate('c', $time));
    }
}
