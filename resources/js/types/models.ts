// ── 通用 API 响应类型 ─────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    code: number;
    data: T;
    message?: string;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// ── 用户 / 认证 ──────────────────────────────────────────────

export interface User {
    id: number;
    username: string;
    nickname: string;
    phone: string | null;
    email: string | null;
    company_id: number;
    header_img: string | null;
    department_name: string | null;
    is_expert: number;
    status: number;
    login_times: number;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    company?: Company;
    roles?: Role[];
}

export interface AuthUser {
    id: number;
    username: string;
    nickname: string;
    header_img: string | null;
    phone: string | null;
    department_name: string | null;
    email: string | null;
    company_id: number;
    is_expert: number;
    status: number;
}

export interface LoginResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_at: string;
}

// ── 角色 / 权限 ──────────────────────────────────────────────

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

// ── 企业 ────────────────────────────────────────────────────

export interface Company {
    id: number;
    title: string;
    short_title: string | null;
    address: string | null;
    /** 统一信用代码 */
    credit_code: string | null;
    /** 安全负责人 */
    supervise_name?: string | null;
    /** 联系电话 */
    supervise_tel?: string | null;
    /** 企业类型ID */
    enterprise_type_id: number | null;
    /** 经营类型ID */
    operational_type_id: number | null;
    /** 区域ID */
    base_area_id: number | null;
    pid: number;
    status: number;
    is_produce: number;
    /** 是否集团 */
    is_bloc?: number;
    sort: number;
    user_id: number;
    last_user_id: number;
    remark: string | null;
    longitude: string | null;
    latitude: string | null;
    created_at: string;
    updated_at: string;
    enterprise_type?: BaseType;
    operational_type?: BaseType;
    base_area?: BaseType;
    pid_name?: Company;
    users?: User[];
}

// ── 基础字典类型 ─────────────────────────────────────────────

export interface BaseType {
    id: number;
    title: string;
    sort?: number;
    created_at?: string;
    updated_at?: string;
}

// ── 表格列定义 ───────────────────────────────────────────────

export interface DataTableColumn<T = Record<string, unknown>> {
    accessorKey?: keyof T & string;
    id?: string;
    header: string;
    cell?: (info: { row: { original: T } }) => React.ReactNode;
    enableSorting?: boolean;
    enableHiding?: boolean;
    size?: number;
}

// ── 菜单项 ──────────────────────────────────────────────────

export interface MenuItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: MenuItem[];
    permission?: string;
}

export interface MenuGroup {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    items: MenuItem[];
}
