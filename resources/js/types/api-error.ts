/**
 * Shape of a Laravel API error payload: `{ status: 'failed', message: string, data?: unknown }`.
 * Used by `getErrorMessage`/`getApiPayload` to safely extract fields from `unknown` errors.
 */
export interface ApiErrorPayload {
    status?: string;
    message?: string;
    data?: unknown;
}

/**
 * Extract a human-readable message from any caught error.
 * Falls back: API `response.data.message` → AxiosError `message` → fallback string.
 */
export function getErrorMessage(err: unknown, fallback = '请求失败'): string {
    if (typeof err === 'object' && err !== null) {
        const maybe = err as {
            response?: { data?: ApiErrorPayload };
            message?: string;
        };
        const apiMessage = maybe.response?.data?.message;

        if (typeof apiMessage === 'string' && apiMessage.length > 0) {
            return apiMessage;
        }

        if (typeof maybe.message === 'string' && maybe.message.length > 0) {
            return maybe.message;
        }
    }

    return fallback;
}

/**
 * Extract the inner `data` field from a Laravel error response (e.g. for `row_errors` on imports).
 */
export function getApiPayload<T = unknown>(err: unknown): T | undefined {
    if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { data?: T } } };

        return maybe.response?.data?.data;
    }

    return undefined;
}

/** Detect axios's request-aborted error so callers can silently bail out of useEffect cleanups. */
export function isAbortedRequest(err: unknown): boolean {
    if (typeof err === 'object' && err !== null) {
        const e = err as { name?: string; code?: string };

        return e.name === 'CanceledError' || e.code === 'ERR_CANCELED';
    }

    return false;
}
