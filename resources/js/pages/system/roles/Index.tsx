import { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2, ShieldCheck, Check, Minus } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface Permission { id: number; name: string }
interface RoleItem { id: number; name: string; guard_name: string; permissions: Permission[] }
interface GroupedPermissions { [module: string]: Permission[] }

type DialogMode = 'create' | 'edit' | null;

const SYSTEM_ROLES = ['super-admin', 'admin', 'reviewer', 'user'];
const NO_EDIT_ROLES = ['super-admin'];
const LOCKED_NAME_ROLES = ['admin', 'reviewer', 'user'];

const ACTION_LABELS: Record<string, string> = {
    list: '列表', create: '新增', update: '编辑', delete: '删除',
    manage: '管理', view: '查看', review: '审核', assign: '分配',
    tree: '树形', portrait: '画像', file: '文件上传', oss: 'OSS上传',
};

function formatModule(name: string): string {
    return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatAction(action: string): string {
    return ACTION_LABELS[action] ?? action;
}

// ── Page ──────────────────────────────────────────────────────────

export default function RolesIndex() {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [grouped, setGrouped] = useState<GroupedPermissions>({});

    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLabel, setDeleteLabel] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [roleName, setRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    const loadRoles = () => {
        setLoadingRoles(true);
        api.get<ApiResponse<RoleItem[]>>('/roles')
            .then((r) => setRoles(r.data.data ?? []))
            .catch(() => {})
            .finally(() => setLoadingRoles(false));
    };

    useEffect(() => {
        loadRoles();
        api.get<ApiResponse<{ list: Permission[]; grouped: GroupedPermissions }>>('/permissions')
            .then((r) => setGrouped(r.data.data?.grouped ?? {}))
            .catch(() => {});
    }, []);

    const openCreate = () => {
        setFormError('');
        setRoleName('');
        setSelectedPerms(new Set());
        setEditingRole(null);
        setDialogMode('create');
    };

    const openEdit = (role: RoleItem) => {
        setFormError('');
        setRoleName(role.name);
        setSelectedPerms(new Set(role.permissions.map((p) => p.name)));
        setEditingRole(role);
        setDialogMode('edit');
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');
        try {
            const permissions = [...selectedPerms];
            if (dialogMode === 'create') {
                if (!roleName.trim()) { setFormError('请输入角色名称'); setFormLoading(false); return; }
                await api.post('/roles', { name: roleName.trim(), permissions });
            } else if (dialogMode === 'edit' && editingRole) {
                const payload: Record<string, unknown> = { permissions };
                if (!LOCKED_NAME_ROLES.includes(editingRole.name)) {
                    if (!roleName.trim()) { setFormError('请输入角色名称'); setFormLoading(false); return; }
                    payload.name = roleName.trim();
                }
                await api.put(`/roles/${editingRole.id}`, payload);
            }
            setDialogMode(null);
            loadRoles();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/roles/${deleteId}`);
        } catch {
            // ignore
        }
        setDeleteId(null);
        setDeleteLabel('');
        loadRoles();
    };

    const togglePerm = (name: string) => {
        setSelectedPerms((prev) => {
            const next = new Set(prev);
            if (next.has(name)) { next.delete(name); } else { next.add(name); }
            return next;
        });
    };

    const toggleModule = (module: string, selectAll: boolean) => {
        const perms = grouped[module] ?? [];
        setSelectedPerms((prev) => {
            const next = new Set(prev);
            perms.forEach((p) => (selectAll ? next.add(p.name) : next.delete(p.name)));
            return next;
        });
    };

    // ── Table columns ──────────────────────────────────────────────

    const columns: ColumnDef<RoleItem>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        {
            id: 'name', header: '角色名称', size: 180,
            cell: ({ row }) => {
                const isSystem = SYSTEM_ROLES.includes(row.original.name);
                return (
                    <span className={cn(
                        'inline-flex items-center gap-1.5 font-medium',
                        isSystem ? 'text-amber-300' : 'text-slate-200',
                    )}>
                        {isSystem && <ShieldCheck className="h-3.5 w-3.5" />}
                        {row.original.name}
                    </span>
                );
            },
        },
        {
            id: 'type', header: '类型', size: 100,
            cell: ({ row }) => {
                const isSystem = SYSTEM_ROLES.includes(row.original.name);
                return (
                    <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        isSystem ? 'bg-amber-600/15 text-amber-400' : 'bg-blue-600/15 text-blue-300',
                    )}>
                        {isSystem ? '系统角色' : '自定义'}
                    </span>
                );
            },
        },
        {
            id: 'perms', header: '权限数量', size: 120,
            cell: ({ row }) => (
                <span className="text-sm text-slate-400">
                    <span className="font-medium text-slate-200">{row.original.permissions.length}</span>
                    <span className="ml-1 text-slate-700">个</span>
                </span>
            ),
        },
        {
            id: 'actions', header: '操作', size: 100,
            cell: ({ row }) => {
                const role = row.original;
                if (NO_EDIT_ROLES.includes(role.name)) {
                    return <span className="text-xs text-slate-700">不可修改</span>;
                }
                return (
                    <div className="flex items-center gap-0.5">
                        <ActionBtn onClick={() => openEdit(role)} title="编辑权限" variant="edit">
                            <Pencil className="h-3.5 w-3.5" />
                        </ActionBtn>
                        {!SYSTEM_ROLES.includes(role.name) && (
                            <ActionBtn
                                onClick={() => { setDeleteId(role.id); setDeleteLabel(role.name); }}
                                title="删除"
                                variant="delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </ActionBtn>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="角色管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">角色管理</h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共 <span className="font-medium text-slate-400">{roles.length}</span> 个角色
                    </p>
                </div>
                <button onClick={openCreate} className={primaryBtn}>
                    <Plus className="h-4 w-4" />新增角色
                </button>
            </div>

            <DataTable
                columns={columns}
                data={roles}
                isLoading={loadingRoles}
                searchPlaceholder="搜索角色名称..."
            />

            {/* Create / Edit modal */}
            <Modal
                open={dialogMode === 'create' || dialogMode === 'edit'}
                onClose={() => setDialogMode(null)}
                wide
            >
                <ModalHeader
                    title={
                        dialogMode === 'create'
                            ? '新增角色'
                            : `编辑角色权限${editingRole ? ` — ${editingRole.name}` : ''}`
                    }
                    onClose={() => setDialogMode(null)}
                />
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {formError && <ErrorAlert message={formError} />}

                    {(dialogMode === 'create' || (editingRole && !LOCKED_NAME_ROLES.includes(editingRole.name))) && (
                        <Field label="角色名称" required>
                            <input
                                className={inputClass}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="输入角色标识，如 manager"
                            />
                        </Field>
                    )}

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                权限分配
                                <span className="ml-2 font-normal text-slate-700">
                                    已选 <span className="text-slate-400">{selectedPerms.size}</span> 个
                                </span>
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const all = Object.values(grouped).flat().map((p) => p.name);
                                        setSelectedPerms(new Set(all));
                                    }}
                                    className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors"
                                >
                                    全选
                                </button>
                                <span className="text-slate-700">·</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPerms(new Set())}
                                    className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    清空
                                </button>
                            </div>
                        </div>
                        <PermissionMatrix
                            grouped={grouped}
                            selected={selectedPerms}
                            onToggle={togglePerm}
                            onToggleModule={toggleModule}
                        />
                    </div>
                </div>
                <ModalFooter onCancel={() => setDialogMode(null)} onConfirm={handleSubmit} loading={formLoading} />
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteLabel(''); }}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">删除角色</h2>
                    <p className="text-sm text-slate-500">
                        确定要删除角色 &ldquo;<span className="font-medium text-slate-300">{deleteLabel}</span>&rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={() => { setDeleteId(null); setDeleteLabel(''); }} className={ghostBtn}>取消</button>
                    <button onClick={handleDelete} className={dangerBtn}>确认删除</button>
                </div>
            </Modal>
        </>
    );
}

// ── Permission matrix ─────────────────────────────────────────────

function PermissionMatrix({
    grouped,
    selected,
    onToggle,
    onToggleModule,
}: {
    grouped: GroupedPermissions;
    selected: Set<string>;
    onToggle: (name: string) => void;
    onToggleModule: (module: string, selectAll: boolean) => void;
}) {
    const modules = useMemo(() => Object.keys(grouped).sort(), [grouped]);

    if (modules.length === 0) {
        return <div className="py-6 text-center text-xs text-slate-700">加载权限列表中...</div>;
    }

    return (
        <div className="max-h-[42vh] overflow-y-auto space-y-1 pr-1">
            {modules.map((module) => {
                const perms = grouped[module];
                const selectedCount = perms.filter((p) => selected.has(p.name)).length;
                const allSelected = selectedCount === perms.length;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                    <div key={module} className="rounded-lg border border-blue-900/25 bg-[#070d1f]/60 px-3 py-2">
                        <div className="flex items-center gap-2 mb-1.5">
                            <button
                                type="button"
                                onClick={() => onToggleModule(module, !allSelected)}
                                className={cn(
                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                                    allSelected
                                        ? 'border-blue-500/60 bg-blue-600/30 text-blue-300'
                                        : someSelected
                                          ? 'border-blue-500/40 bg-blue-600/15 text-blue-400'
                                          : 'border-blue-900/50 bg-transparent text-transparent hover:border-blue-700/50',
                                )}
                            >
                                {allSelected ? (
                                    <Check className="h-2.5 w-2.5" />
                                ) : someSelected ? (
                                    <Minus className="h-2.5 w-2.5" />
                                ) : null}
                            </button>
                            <span className="text-xs font-medium text-slate-400">{formatModule(module)}</span>
                            <span className="text-[10px] text-slate-700 ml-auto">
                                {selectedCount}/{perms.length}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-6">
                            {perms.map((p) => {
                                const action = p.name.split('.').slice(1).join('.');
                                const active = selected.has(p.name);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => onToggle(p.name)}
                                        className={cn(
                                            'rounded px-2 py-0.5 text-[11px] border transition-colors',
                                            active
                                                ? 'bg-blue-600/20 text-blue-300 border-blue-500/35 hover:bg-blue-600/30'
                                                : 'bg-transparent text-slate-600 border-blue-900/30 hover:text-slate-400 hover:border-blue-800/50',
                                        )}
                                    >
                                        {formatAction(action)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Shared primitives ─────────────────────────────────────────────

const inputClass = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed';
const primaryBtn = 'flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 hover:text-blue-200 active:scale-95';
const ghostBtn = 'rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200';
const dangerBtn = 'flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}{required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{message}
        </div>
    );
}

function Modal({
    open,
    onClose,
    children,
    wide,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={cn(
                'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60',
                wide ? 'max-w-2xl' : 'max-w-lg',
            )}>
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
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
            <button onClick={onCancel} className={ghostBtn}>取消</button>
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
