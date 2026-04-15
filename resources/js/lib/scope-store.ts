/**
 * Module-level singleton that holds the active scope company ID.
 * Used by the Axios interceptor (which can't use React hooks) to attach
 * X-Scope-Company-Id to every authenticated API request.
 */
let _scopeCompanyId: number | null = null;

export function setScopeCompanyId(id: number | null): void {
    _scopeCompanyId = id;
}

export function getScopeCompanyId(): number | null {
    return _scopeCompanyId;
}
