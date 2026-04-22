import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/lib/auth';
import type { AuthUser, Role } from '@/types/models';

interface AuthState {
    user: AuthUser | null;
    company: { id: number; title: string } | null;
    roles: Role[];
    permissions: string[];
    isLoading: boolean;
    isAuthenticated: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        company: null,
        roles: [],
        permissions: [],
        isLoading: true,
        isAuthenticated: false,
    });
    const fetched = useRef(false);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setState((s) => ({
                ...s,
                isLoading: false,
                isAuthenticated: false,
            }));

            return;
        }

        try {
            const data = await authApi.userInfo();
            setState({
                user: data.user,
                company: data.company,
                roles: data.roles,
                permissions: data.permissions,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch {
            localStorage.removeItem('access_token');
            setState({
                user: null,
                company: null,
                roles: [],
                permissions: [],
                isLoading: false,
                isAuthenticated: false,
            });
        }
    }, []);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            fetchUser();
        }
    }, [fetchUser]);

    const hasPermission = useCallback(
        (permission: string) => {
            return (
                state.permissions.includes(permission) ||
                state.roles.some((r) => r.name === 'super-admin')
            );
        },
        [state.permissions, state.roles],
    );

    const hasRole = useCallback(
        (...roles: string[]) => {
            return state.roles.some((r) => roles.includes(r.name));
        },
        [state.roles],
    );

    const login = useCallback(
        async (username: string, password: string) => {
            const data = await authApi.login(username, password);
            localStorage.setItem('access_token', data.access_token);
            await fetchUser();

            return data;
        },
        [fetchUser],
    );

    const logout = useCallback(async () => {
        await authApi.logout();
        setState({
            user: null,
            company: null,
            roles: [],
            permissions: [],
            isLoading: false,
            isAuthenticated: false,
        });
        window.location.href = '/login';
    }, []);

    return {
        ...state,
        hasPermission,
        hasRole,
        login,
        logout,
        refetch: fetchUser,
    };
}
