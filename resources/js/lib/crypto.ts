import { JSEncrypt } from 'jsencrypt';
import type { ApiResponse } from '@/types/models';
import api from './api';

let cachedPublicKey: string | null = null;

async function getPublicKey(): Promise<string> {
    if (cachedPublicKey) {
        return cachedPublicKey;
    }

    const { data } =
        await api.get<ApiResponse<{ public_key: string }>>('/public-key');
    cachedPublicKey = data.data.public_key;

    return cachedPublicKey;
}

/** RSA-encrypt a plaintext password. Returns a base64 ciphertext string. */
export async function encryptPassword(plain: string): Promise<string> {
    const publicKey = await getPublicKey();

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const encrypted = encrypt.encrypt(plain);

    if (!encrypted) {
        throw new Error('密码加密失败，请刷新页面重试');
    }

    return encrypted;
}

/** Pre-fetch and cache the public key so the first login has no latency. */
export function prefetchPublicKey(): void {
    getPublicKey().catch(() => {});
}
