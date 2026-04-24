import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    KeyRound,
    ShieldCheck,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DetailButton } from '@/components/shared/DetailButton';
import { ObjectDetailDrawer } from '@/components/shared/ObjectDetailDrawer';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { useDetailDrawer } from '@/hooks/use-detail-drawer';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, User, Role } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

type DialogMode = 'create' | 'edit' | 'password' | null;

const SYSTEM_ROLES = ['super-admin', 'admin', 'reviewer', 'user'];

// ── Page ──────────────────────────────────────────────────────────

export default function UsersIndex() {
    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
        search,
    } = useApiList<User>({ endpoint: '/users' });
    const crud = useApiCrud('/users');
    const { canWrite } = usePermission();
    const canCreate = canWrite('users.create');
    const canUpdate = canWrite('users.update');
    const canDelete = canWrite('users.delete');

    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const detail = useDetailDrawer<User>();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [filters, setFilters] = useState({
        username: '',
        status: '',
        role: '',
    });
    const [roles, setRoles] = useState<Role[]>([]);

    const [form, setForm] = useState({
        username: '',
        password: '',
        nickname: '',
        phone: '',
        email: '',
        role: 'user',
        status: '1',
    });
    const [pwForm, setPwForm] = useState({ password: '', confirm: '' });

    useEffect(() => {
        api.get<ApiResponse<Role[]>>('/roles')
            .then((r) => setRoles(r.data.data ?? []))
            .catch(() => {});
    }, []);

    const applyFilters = useCallback(
        (next: typeof filters) => {
            search({
                username: next.username || undefined,
                status: next.status || undefined,
                role: next.role || undefined,
            });
        },
        [search],
    );

    const updateFilter = (key: keyof typeof filters, value: string) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        applyFilters(next);
    };

    const openCreate = () => {
        setFormError('');
        setForm({
            username: '',
            password: '',
            nickname: '',
            phone: '',
            email: '',
            role: 'user',
            status: '1',
        });
        setEditingUser(null);
        setDialogMode('create');
    };

    const openEdit = (user: User) => {
        setFormError('');
        setForm({
            username: user.username,
            password: '',
            nickname: user.nickname ?? '',
            phone: user.phone ?? '',
            email: user.email ?? '',
            role: user.roles?.[0]?.name ?? 'user',
            status: String(user.status ?? 1),
        });
        setEditingUser(user);
        setDialogMode('edit');
    };

    const openPassword = (user: User) => {
        setFormError('');
        setPwForm({ password: '', confirm: '' });
        setEditingUser(user);
        setDialogMode('password');
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            if (dialogMode === 'create') {
                await crud.create({
                    username: form.username,
                    password: form.password,
                    nickname: form.nickname,
                    phone: form.phone || null,
                    email: form.email || null,
                    role: form.role,
                });
            } else if (dialogMode === 'edit' && editingUser) {
                await crud.update(editingUser.id, {
                    nickname: form.nickname,
                    phone: form.phone || null,
                    email: form.email || null,
                    status: Number(form.status),
                });
                const prevRole = editingUser.roles?.[0]?.name ?? 'user';

                if (form.role !== prevRole) {
                    await api.put(`/users/${editingUser.id}/role`, {
                        role: form.role,
                    });
                }
            }

            setDialogMode(null);
            reload();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setFormLoading(false);
        }
    };

    const handlePassword = async () => {
        if (!editingUser) {
            return;
        }

        if (pwForm.password.length < 6) {
            setFormError('密码不少于6位');

            return;
        }

        if (pwForm.password !== pwForm.confirm) {
            setFormError('两次密码不一致');

            return;
        }

        setFormLoading(true);
        setFormError('');

        try {
            await api.put(`/users/${editingUser.id}/password`, {
                password: pwForm.password,
            });
            setDialogMode(null);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e.response?.data?.message ?? '密码重置失败');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        await crud.remove(deleteId);
        setDeleteId(null);
        setDeleteLabel('');
        reload();
    };

    const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    // ── Table columns ──────────────────────────────────────────────

    const columns: ColumnDef<User>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'username', header: '用户名', size: 140 },
        { accessorKey: 'nickname', header: '昵称', size: 120 },
        {
            id: 'company',
            header: '所属企业',
            cell: ({ row }) =>
                row.original.company?.title ? (
                    <span className="text-slate-300">
                        {row.original.company.title}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            id: 'role',
            header: '角色',
            size: 130,
            cell: ({ row }) => {
                const role = row.original.roles?.[0];

                if (!role) {
                    return <span className="text-slate-700">—</span>;
                }

                const isSystem = SYSTEM_ROLES.includes(role.name);

                return (
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            isSystem
                                ? 'bg-amber-600/15 text-amber-300'
                                : 'bg-blue-600/15 text-blue-300',
                        )}
                    >
                        {isSystem && <ShieldCheck className="h-3 w-3" />}
                        {role.name}
                    </span>
                );
            },
        },
        {
            id: 'status',
            header: '状态',
            size: 80,
            cell: ({ row }) => (
                <span
                    className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        row.original.status === 1
                            ? 'bg-green-600/15 text-green-300'
                            : 'bg-red-600/15 text-red-400',
                    )}
                >
                    {row.original.status === 1 ? '启用' : '禁用'}
                </span>
            ),
        },
        { accessorKey: 'phone', header: '手机号', size: 130 },
        {
            id: 'actions',
            header: '操作',
            size: 160,
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    <DetailButton
                        row={row.original}
                        onOpen={detail.openDetail}
                    />
                    {canUpdate && (
                        <ActionBtn
                            onClick={() => openEdit(row.original)}
                            title="编辑"
                            variant="edit"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                    {canUpdate && (
                        <ActionBtn
                            onClick={() => openPassword(row.original)}
                            title="重置密码"
                            variant="edit"
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                    {canDelete && (
                        <ActionBtn
                            onClick={() => {
                                setDeleteId(row.original.id);
                                setDeleteLabel(row.original.username);
                            }}
                            title="删除"
                            variant="delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                </div>
            ),
        },
    ];

    // ── Filter toolbar ─────────────────────────────────────────────

    const filterToolbar = (
        <div className="flex items-center gap-2">
            <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className={selectClass}
            >
                <option value="">全部状态</option>
                <option value="1">启用</option>
                <option value="2">禁用</option>
            </select>
            <select
                value={filters.role}
                onChange={(e) => updateFilter('role', e.target.value)}
                className={selectClass}
            >
                <option value="">全部角色</option>
                {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                        {r.name}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <>
            <Head title="账号管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        账号管理
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        个用户
                    </p>
                </div>
                {canCreate && (
                    <button onClick={openCreate} className={primaryBtn}>
                        <Plus className="h-4 w-4" />
                        新增用户
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索用户名..."
                searchValue={filters.username}
                onSearchChange={(v) => updateFilter('username', v)}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
                toolbar={filterToolbar}
            />

            <ObjectDetailDrawer
                open={detail.open}
                title="账号详情"
                data={detail.data as Record<string, unknown> | null}
                onClose={detail.close}
                labels={{
                    username: '用户名',
                    nickname: '昵称',
                    company: '所属企业',
                    title: '企业名称',
                    roles: '角色',
                    name: '名称',
                    status: '状态',
                    phone: '手机号',
                    email: '邮箱',
                    company_id: '企业ID',
                    created_at: '创建时间',
                    updated_at: '更新时间',
                }}
                hiddenKeys={['remember_token', 'pivot']}
            />

            {/* Create / Edit modal */}
            <Modal
                open={dialogMode === 'create' || dialogMode === 'edit'}
                onClose={() => setDialogMode(null)}
            >
                <ModalHeader
                    title={dialogMode === 'create' ? '新增用户' : '编辑用户'}
                    onClose={() => setDialogMode(null)}
                />
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {formError && <ErrorAlert message={formError} />}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="用户名" required>
                            <input
                                className={inputClass}
                                value={form.username}
                                onChange={(e) =>
                                    setF('username', e.target.value)
                                }
                                disabled={dialogMode === 'edit'}
                                placeholder="登录账号"
                            />
                        </Field>
                        <Field label="昵称" required>
                            <input
                                className={inputClass}
                                value={form.nickname}
                                onChange={(e) =>
                                    setF('nickname', e.target.value)
                                }
                                placeholder="显示名称"
                            />
                        </Field>
                    </div>
                    {dialogMode === 'create' && (
                        <Field label="密码" required>
                            <input
                                type="password"
                                className={inputClass}
                                value={form.password}
                                onChange={(e) =>
                                    setF('password', e.target.value)
                                }
                                placeholder="至少6位"
                            />
                        </Field>
                    )}
                    <Field label="角色">
                        <select
                            className={inputClass}
                            value={form.role}
                            onChange={(e) => setF('role', e.target.value)}
                        >
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="手机号">
                            <input
                                className={inputClass}
                                value={form.phone}
                                onChange={(e) => setF('phone', e.target.value)}
                                placeholder="选填"
                            />
                        </Field>
                        <Field label="邮箱">
                            <input
                                type="email"
                                className={inputClass}
                                value={form.email}
                                onChange={(e) => setF('email', e.target.value)}
                                placeholder="选填"
                            />
                        </Field>
                    </div>
                    {dialogMode === 'edit' && (
                        <Field label="状态">
                            <select
                                className={inputClass}
                                value={form.status}
                                onChange={(e) => setF('status', e.target.value)}
                            >
                                <option value="1">启用</option>
                                <option value="2">禁用</option>
                            </select>
                        </Field>
                    )}
                </div>
                <ModalFooter
                    onCancel={() => setDialogMode(null)}
                    onConfirm={handleSubmit}
                    loading={formLoading}
                />
            </Modal>

            {/* Reset password modal */}
            <Modal
                open={dialogMode === 'password'}
                onClose={() => setDialogMode(null)}
            >
                <ModalHeader
                    title={`重置密码 — ${editingUser?.username}`}
                    onClose={() => setDialogMode(null)}
                />
                <div className="flex-1 space-y-4 p-6">
                    {formError && <ErrorAlert message={formError} />}
                    <Field label="新密码" required>
                        <input
                            type="password"
                            className={inputClass}
                            value={pwForm.password}
                            onChange={(e) =>
                                setPwForm((f) => ({
                                    ...f,
                                    password: e.target.value,
                                }))
                            }
                            placeholder="至少6位"
                        />
                    </Field>
                    <Field label="确认密码" required>
                        <input
                            type="password"
                            className={inputClass}
                            value={pwForm.confirm}
                            onChange={(e) =>
                                setPwForm((f) => ({
                                    ...f,
                                    confirm: e.target.value,
                                }))
                            }
                            placeholder="再次输入密码"
                        />
                    </Field>
                </div>
                <ModalFooter
                    onCancel={() => setDialogMode(null)}
                    onConfirm={handlePassword}
                    loading={formLoading}
                    confirmLabel="重置密码"
                />
            </Modal>

            {/* Delete confirm */}
            <Modal
                open={!!deleteId}
                onClose={() => {
                    setDeleteId(null);
                    setDeleteLabel('');
                }}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除用户
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除用户 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteLabel}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => {
                            setDeleteId(null);
                            setDeleteLabel('');
                        }}
                        className={ghostBtn}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={crud.loading}
                        className={dangerBtn}
                    >
                        {crud.loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {crud.loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}

// ── Shared primitives ─────────────────────────────────────────────

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const selectClass =
    'h-9 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 pr-8 text-xs text-slate-400 outline-none transition-colors focus:border-blue-500/60 appearance-none cursor-pointer';
const primaryBtn =
    'flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 hover:text-blue-200 active:scale-95';
const ghostBtn =
    'rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200';
const dangerBtn =
    'flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50';

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {message}
        </div>
    );
}

function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

function ModalHeader({
    title,
    onClose,
}: {
    title: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function ModalFooter({
    onCancel,
    onConfirm,
    loading,
    confirmLabel = '保存',
}: {
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
    confirmLabel?: string;
}) {
    return (
        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
            <button onClick={onCancel} className={ghostBtn}>
                取消
            </button>
            <button
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
            >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? '保存中...' : confirmLabel}
            </button>
        </div>
    );
}

function ActionBtn({
    children,
    onClick,
    title,
    variant,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    variant: 'edit' | 'delete';
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                variant === 'edit'
                    ? 'text-slate-600 hover:bg-blue-600/10 hover:text-blue-400'
                    : 'text-slate-600 hover:bg-red-600/10 hover:text-red-400',
            )}
        >
            {children}
        </button>
    );
}
