<?php

namespace App\Services;

use RuntimeException;

class RsaService
{
    public function __construct(
        private readonly string $privateKey,
        private readonly string $publicKey,
    ) {}

    /**
     * Decrypt a base64-encoded RSA ciphertext using the private key.
     *
     * @throws RuntimeException when decryption fails (tampered/invalid ciphertext)
     */
    public function decrypt(string $base64Ciphertext): string
    {
        $ciphertext = base64_decode($base64Ciphertext, strict: true);

        if ($ciphertext === false) {
            throw new RuntimeException('密码格式无效');
        }

        $result = '';
        $success = openssl_private_decrypt($ciphertext, $result, $this->privateKey);

        if (! $success) {
            throw new RuntimeException('密码解密失败');
        }

        return $result;
    }

    /** Return the PEM public key string for the client. */
    public function publicKey(): string
    {
        return $this->publicKey;
    }
}
