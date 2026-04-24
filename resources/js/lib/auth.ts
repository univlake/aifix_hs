import type {
    ApiResponse,
    LoginResponse,
    AuthUser,
    Role,
    Permission,
} from '@/types/models';
import api from './api';
import { encryptPassword } from './crypto';

export const authApi = {
    /** 登录 — 密码 RSA 加密后传输，返回 access_token */
    async login(username: string, password: string): Promise<LoginResponse> {
        const encryptedPassword = await encryptPassword(password);
        const { data } = await api.post<ApiResponse<LoginResponse>>('/login', {
            username,
            password: encryptedPassword,
        });

        return data.data;
    },

    /** 注册 — 两个密码字段均 RSA 加密后传输 */
    async register(payload: {
        username: string;
        password: string;
        password_confirmation: string;
        nickname: string;
        company_id: number;
        phone?: string;
        email?: string;
    }) {
        const [encryptedPassword, encryptedConfirmation] = await Promise.all([
            encryptPassword(payload.password),
            encryptPassword(payload.password_confirmation),
        ]);

        const { data } = await api.post<ApiResponse<unknown>>('/register', {
            ...payload,
            password: encryptedPassword,
            password_confirmation: encryptedConfirmation,
        });

        return data.data;
    },

    /** 登出 */
    async logout() {
        await api.post('/logout');
        localStorage.removeItem('access_token');
    },

    /** 获取当前用户信息（含角色 + 权限） */
    async userInfo(): Promise<{
        user: AuthUser;
        company: { id: number; title: string } | null;
        roles: Role[];
        permissions: string[];
    }> {
        const { data } = await api.get<
            ApiResponse<
                AuthUser & {
                    company: { id: number; title: string } | null;
                    roles: string[];
                    permissions: string[];
                }
            >
        >('/user-info');
        const { company, roles, permissions, ...user } = data.data;

        return {
            user: user as AuthUser,
            company,
            roles: roles.map((name) => ({ name })) as Role[],
            permissions,
        };
    },

    /** 公开企业列表 — 注册时选择所属企业，无需认证 */
    async companiesPublic(): Promise<{ id: number; title: string }[]> {
        const { data } =
            await api.get<ApiResponse<{ id: number; title: string }[]>>(
                '/companies-public',
            );

        return data.data;
    },

    /** 获取所有权限列表（按模块分组） */
    async permissions() {
        const { data } =
            await api.get<
                ApiResponse<{
                    list: Permission[];
                    grouped: Record<string, Permission[]>;
                }>
            >('/permissions');

        return data.data;
    },

    /** 重置密码 */
    async resetPassword(payload: {
        username: string;
        old_password: string;
        new_password: string;
        new_password_confirmation: string;
    }) {
        const { data } = await api.post<ApiResponse<unknown>>(
            '/reset-password',
            payload,
        );

        return data.data;
    },

    /** 更新当前用户的个人资料（可选同时修改用户名） */
    async updateUserInfo(payload: {
        nickname: string;
        username?: string;
        phone?: string | null;
        email?: string | null;
        header_img?: string | null;
    }) {
        const { data } = await api.put<ApiResponse<unknown>>(
            '/user-info',
            payload,
        );

        return data.data;
    },

    /** 实时检查用户名是否可用 — 排除当前用户自己 */
    async checkUsernameAvailability(
        username: string,
        signal?: AbortSignal,
    ): Promise<{ available: boolean; reason: string | null }> {
        const { data } = await api.get<
            ApiResponse<{ available: boolean; reason: string | null }>
        >('/username-availability', {
            params: { username },
            signal,
        });

        return data.data;
    },

    /** 首次登录必改 — 同时修改用户名和密码，成功后清除 must_change_credentials */
    async firstLoginSetup(payload: {
        new_username: string;
        new_password: string;
        new_password_confirmation: string;
    }) {
        const { data } = await api.post<ApiResponse<unknown>>(
            '/first-login-setup',
            payload,
        );

        return data.data;
    },
};
