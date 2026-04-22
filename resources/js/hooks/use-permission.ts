import { useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';

/**
 * Permission + scope gate.
 *
 * - `can(perm)` — user has the permission.
 * - `canWrite(perm)` — has the permission AND is NOT viewing as a subordinate
 *   (集团账号下钻到下级企业时不允许写操作).
 * - `hasAny(perms)` / `hasAll(perms)` — multi-permission helpers.
 * - `isSubordinate` — re-exported for components that need their own branching.
 */
export function usePermission() {
    const { hasPermission } = useAuth();
    const { isSubordinate } = useScope();

    const can = useCallback(
        (permission: string) => hasPermission(permission),
        [hasPermission],
    );

    const canWrite = useCallback(
        (permission: string) => hasPermission(permission) && !isSubordinate,
        [hasPermission, isSubordinate],
    );

    const hasAny = useCallback(
        (permissions: string[]) => permissions.some((p) => hasPermission(p)),
        [hasPermission],
    );

    const hasAll = useCallback(
        (permissions: string[]) => permissions.every((p) => hasPermission(p)),
        [hasPermission],
    );

    return { can, canWrite, hasAny, hasAll, isSubordinate };
}
