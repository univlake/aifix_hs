import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/auth';
import { useDebounce } from './use-debounce';

type Status = 'idle' | 'checking' | 'available' | 'unavailable';

export interface UsernameCheckState {
    status: Status;
    reason: string | null;
}

interface CachedResult {
    username: string;
    available: boolean;
    reason: string | null;
}

/**
 * GitHub 式用户名可用性检查 — 防抖 + 可取消。
 * 空值或与 skip 相同时回到 idle（不触发请求），其他值防抖后请求后端。
 * status 由 debounced 值 + 最近一次响应派生，避免在 effect 中同步 setState。
 */
export function useUsernameCheck(
    username: string,
    skip?: string,
    debounceMs = 350,
): UsernameCheckState {
    const debounced = useDebounce(username.trim(), debounceMs);
    const [result, setResult] = useState<CachedResult | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        abortRef.current?.abort();

        if (!debounced || debounced === skip) {
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        authApi
            .checkUsernameAvailability(debounced, controller.signal)
            .then((res) => {
                if (controller.signal.aborted) {
                    return;
                }

                setResult({ username: debounced, ...res });
            })
            .catch((err: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                const name = (err as { name?: string } | null)?.name;

                if (name === 'CanceledError' || name === 'AbortError') {
                    return;
                }
            });

        return () => controller.abort();
    }, [debounced, skip]);

    if (!debounced || debounced === skip) {
        return { status: 'idle', reason: null };
    }

    if (result?.username === debounced) {
        return {
            status: result.available ? 'available' : 'unavailable',
            reason: result.reason,
        };
    }

    return { status: 'checking', reason: null };
}
