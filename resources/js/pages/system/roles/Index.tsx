import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Loader2,
    ShieldCheck,
    Check,
    Minus,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { formatAction, formatModule } from '@/lib/permission-labels';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface Permission {
    id: number;
    name: string;
}
interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}
interface GroupedPermissions {
    [module: string]: Permission[];
}

type DialogMode = 'create' | 'edit' | null;

const SYSTEM_ROLES = ['super-admin', 'admin', 'reviewer', 'user'];
const NO_EDIT_ROLES = ['super-admin'];
const LOCKED_NAME_ROLES = ['admin', 'reviewer', 'user'];

// ── Role templates ────────────────────────────────────────────────
// Clickable presets that pre-select a curated bundle of module prefixes.
// `modules` is matched against the permission's module prefix (the part before
// the first dot). `actions` optionally limits which actions are selected; when
// omitted, all actions for that module are included.

interface RoleTemplate {
    key: string;
    label: string;
    description: string;
    /** Module prefixes to include. e.g. 'hazards' matches 'hazards.list/create/etc.' */
    modules?: string[];
    /** If set, select all known modules except these. Overrides `modules`. */
    excludeModules?: string[];
    /** If set, only include permissions whose action (suffix) is in this list. */
    actions?: string[];
}

// 考核模板管理 涵盖 日常 / 事故 / 加分 三类模板
const ASSESSMENT_TEMPLATE_MODULES = [
    'daily-check-templates',
    'accident-check-templates',
    'add-points-templates',
];

const ROLE_TEMPLATES: RoleTemplate[] = [
    {
        key: 'group-general-manager',
        label: '集团总经理',
        description: '除基础数据、考核模板管理、角色管理、权限管理外，拥有全部权限',
        excludeModules: [
            'base-data',
            ...ASSESSMENT_TEMPLATE_MODULES,
            'roles',
            'permissions',
        ],
    },
    {
        key: 'production-general-manager',
        label: '生产总经理',
        description: '拥有生产视图下全部模块权限',
        modules: [
            'homes',
            'companies',
            'safety-architectures',
            'personnels',
            'filing-permissions',
            'buildings',
            'security-investments',
            'special-equipment',
            'dangerous-equipment',
            'hazardous-chemicals',
            'major-hazards',
            'major-hazardous-processes',
            'hazardous-processes',
            'space-works',
            'hazards',
            'monthly-investigations',
            'job-management',
            'three-togethers',
            'assess-detects',
            'risk-logs',
            'expert-inspections',
            'internal-meetings',
            'internal-trainings',
            'external-trainings',
            'other-trainings',
            'design-units',
            'evaluation-units',
            'skill-units',
            'health-files',
            'occupational-hazards',
            'health-checkups',
            'hygiene-evaluations',
            'health-reports',
            'fire-safeties',
            'fire-equipment',
            'fire-facilities',
            'accident-bulletins',
            'emergency-teams',
            'emergency-supplies',
            'emergency-drills',
            'meetings',
            'office-notifies',
            'new-notifies',
            'information-drafts',
            'month-statistics',
            'year-statistics',
            'change-manages',
            'regulation-libraries',
            'checklist-libraries',
            'add-points',
            'training-files',
            'training-videos',
            'users',
        ],
    },
    {
        key: 'admin-general-manager',
        label: '行政总经理',
        description: '集团视图下全部模块权限（不含基础数据、考核模板、角色、权限）',
        modules: [
            'homes',
            'companies',
            'risk-distribution-maps',
            'major-hazards',
            'online-inspection',
            'bloc-risks',
            'special-equipment',
            'monthly-investigations',
            'expert-inspections',
            'internal-meetings',
            'internal-trainings',
            'external-trainings',
            'other-trainings',
            'regulation-libraries',
            'checklist-libraries',
            'meetings',
            'office-notifies',
            'new-notifies',
            'information-drafts',
            'emergency-teams',
            'emergency-drills',
            'accident-bulletins',
            'bloc-experts',
            'add-points',
            'month-statistics',
            'year-statistics',
            'training-files',
            'training-videos',
            'users',
        ],
    },
    {
        key: 'external-expert',
        label: '外部专家',
        description: '仅拥有专家检查模块与仪表板权限',
        modules: ['homes', 'expert-inspections'],
    },
];

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
    const [permSearch, setPermSearch] = useState('');

    const { canWrite } = usePermission();
    const canCreate = canWrite('roles.create');
    const canUpdate = canWrite('roles.update');
    const canDelete = canWrite('roles.delete');

    const loadRoles = () => {
        setLoadingRoles(true);
        api.get<ApiResponse<RoleItem[]>>('/roles')
            .then((r) => setRoles(r.data.data ?? []))
            .catch(() => {})
            .finally(() => setLoadingRoles(false));
    };

    useEffect(() => {
        loadRoles();
        api.get<
            ApiResponse<{ list: Permission[]; grouped: GroupedPermissions }>
        >('/permissions')
            .then((r) => setGrouped(r.data.data?.grouped ?? {}))
            .catch(() => {});
    }, []);

    const openCreate = () => {
        setFormError('');
        setRoleName('');
        setSelectedPerms(new Set());
        setPermSearch('');
        setEditingRole(null);
        setDialogMode('create');
    };

    const openEdit = (role: RoleItem) => {
        setFormError('');
        setRoleName(role.name);
        setSelectedPerms(new Set(role.permissions.map((p) => p.name)));
        setPermSearch('');
        setEditingRole(role);
        setDialogMode('edit');
    };

    const applyTemplate = (tpl: RoleTemplate) => {
        const all: string[] = [];
        const exclude = tpl.excludeModules;
        const targetModules = exclude
            ? Object.keys(grouped).filter((m) => !exclude.includes(m))
            : (tpl.modules ?? []);

        for (const module of targetModules) {
            const modulePerms = grouped[module] ?? [];

            for (const p of modulePerms) {
                const action = p.name.split('.').slice(1).join('.');

                if (!tpl.actions || tpl.actions.includes(action)) {
                    all.push(p.name);
                }
            }
        }

        setSelectedPerms(new Set(all));
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setFormError('');

        try {
            const permissions = [...selectedPerms];

            if (dialogMode === 'create') {
                if (!roleName.trim()) {
                    setFormError('请输入角色名称');
                    setFormLoading(false);

                    return;
                }

                await api.post('/roles', {
                    name: roleName.trim(),
                    permissions,
                });
            } else if (dialogMode === 'edit' && editingRole) {
                const payload: Record<string, unknown> = { permissions };

                if (!LOCKED_NAME_ROLES.includes(editingRole.name)) {
                    if (!roleName.trim()) {
                        setFormError('请输入角色名称');
                        setFormLoading(false);

                        return;
                    }

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
        if (!deleteId) {
            return;
        }

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

            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }

            return next;
        });
    };

    const toggleModule = (module: string, selectAll: boolean) => {
        const perms = grouped[module] ?? [];
        setSelectedPerms((prev) => {
            const next = new Set(prev);
            perms.forEach((p) =>
                selectAll ? next.add(p.name) : next.delete(p.name),
            );

            return next;
        });
    };

    // ── Table columns ──────────────────────────────────────────────

    const columns: ColumnDef<RoleItem>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        {
            id: 'name',
            header: '角色名称',
            size: 180,
            cell: ({ row }) => {
                const isSystem = SYSTEM_ROLES.includes(row.original.name);

                return (
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 font-medium',
                            isSystem ? 'text-amber-300' : 'text-slate-200',
                        )}
                    >
                        {isSystem && <ShieldCheck className="h-3.5 w-3.5" />}
                        {row.original.name}
                    </span>
                );
            },
        },
        {
            id: 'type',
            header: '类型',
            size: 100,
            cell: ({ row }) => {
                const isSystem = SYSTEM_ROLES.includes(row.original.name);

                return (
                    <span
                        className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            isSystem
                                ? 'bg-amber-600/15 text-amber-400'
                                : 'bg-blue-600/15 text-blue-300',
                        )}
                    >
                        {isSystem ? '系统角色' : '自定义'}
                    </span>
                );
            },
        },
        {
            id: 'perms',
            header: '权限数量',
            size: 120,
            cell: ({ row }) => (
                <span className="text-sm text-slate-400">
                    <span className="font-medium text-slate-200">
                        {row.original.permissions.length}
                    </span>
                    <span className="ml-1 text-slate-700">个</span>
                </span>
            ),
        },
    ];

    if (canUpdate || canDelete) {
        columns.push({
            id: 'actions',
            header: '操作',
            size: 100,
            cell: ({ row }) => {
                const role = row.original;

                if (NO_EDIT_ROLES.includes(role.name)) {
                    return (
                        <span className="text-xs text-slate-700">不可修改</span>
                    );
                }

                return (
                    <div className="flex items-center gap-0.5">
                        {canUpdate && (
                            <ActionBtn
                                onClick={() => openEdit(role)}
                                title="编辑权限"
                                variant="edit"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </ActionBtn>
                        )}
                        {canDelete && !SYSTEM_ROLES.includes(role.name) && (
                            <ActionBtn
                                onClick={() => {
                                    setDeleteId(role.id);
                                    setDeleteLabel(role.name);
                                }}
                                title="删除"
                                variant="delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </ActionBtn>
                        )}
                    </div>
                );
            },
        });
    }

    return (
        <>
            <Head title="角色管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        角色管理
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        共{' '}
                        <span className="font-medium text-slate-400">
                            {roles.length}
                        </span>{' '}
                        个角色
                    </p>
                </div>
                {canCreate && (
                    <button onClick={openCreate} className={primaryBtn}>
                        <Plus className="h-4 w-4" />
                        新增角色
                    </button>
                )}
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
                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {formError && <ErrorAlert message={formError} />}

                    {(dialogMode === 'create' ||
                        (editingRole &&
                            !LOCKED_NAME_ROLES.includes(editingRole.name))) && (
                        <Field label="角色名称" required>
                            <input
                                className={inputClass}
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="输入角色标识，如 manager"
                            />
                        </Field>
                    )}

                    {/* Role templates — clickable presets */}
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                快速模板
                                <span className="ml-2 font-normal text-slate-700">
                                    一键预选常用权限组合，应用后可继续微调
                                </span>
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {ROLE_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.key}
                                    type="button"
                                    onClick={() => applyTemplate(tpl)}
                                    title={tpl.description}
                                    className="rounded-md border border-violet-500/25 bg-violet-600/8 px-2 py-1 text-[11px] text-violet-300 transition-colors hover:border-violet-400/40 hover:bg-violet-600/15"
                                >
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                权限分配
                                <span className="ml-2 font-normal text-slate-700">
                                    已选{' '}
                                    <span className="text-slate-400">
                                        {selectedPerms.size}
                                    </span>{' '}
                                    个
                                </span>
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const all = Object.values(grouped)
                                            .flat()
                                            .map((p) => p.name);
                                        setSelectedPerms(new Set(all));
                                    }}
                                    className="text-[11px] text-blue-500 transition-colors hover:text-blue-400"
                                >
                                    全选
                                </button>
                                <span className="text-slate-700">·</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPerms(new Set())}
                                    className="text-[11px] text-slate-600 transition-colors hover:text-slate-400"
                                >
                                    清空
                                </button>
                            </div>
                        </div>
                        <div className="relative mb-2">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                            <input
                                type="search"
                                placeholder="搜索模块或权限关键词（如：隐患、training、hazards.list）"
                                value={permSearch}
                                onChange={(e) => setPermSearch(e.target.value)}
                                className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] py-1.5 pr-3 pl-8 text-xs text-slate-200 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                            />
                        </div>
                        <PermissionMatrix
                            grouped={grouped}
                            selected={selectedPerms}
                            onToggle={togglePerm}
                            onToggleModule={toggleModule}
                            searchQuery={permSearch}
                        />
                    </div>
                </div>
                <ModalFooter
                    onCancel={() => setDialogMode(null)}
                    onConfirm={handleSubmit}
                    loading={formLoading}
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
                        删除角色
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除角色 &ldquo;
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
                    <button onClick={handleDelete} className={dangerBtn}>
                        确认删除
                    </button>
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
    searchQuery = '',
}: {
    grouped: GroupedPermissions;
    selected: Set<string>;
    onToggle: (name: string) => void;
    onToggleModule: (module: string, selectAll: boolean) => void;
    searchQuery?: string;
}) {
    const q = searchQuery.trim().toLowerCase();

    // Filter modules/permissions by search query. A module is shown if its name
    // matches OR any of its permissions match (by permission name or action label).
    const filtered = useMemo(() => {
        const allModules = Object.keys(grouped).sort();

        if (!q) {
            return allModules.map((m) => ({ module: m, perms: grouped[m] }));
        }

        return allModules
            .map((module) => {
                const moduleMatches =
                    module.toLowerCase().includes(q) ||
                    formatModule(module).toLowerCase().includes(q);
                const perms = grouped[module].filter((p) => {
                    if (moduleMatches) {
                        return true;
                    }

                    const action = p.name.split('.').slice(1).join('.');

                    return (
                        p.name.toLowerCase().includes(q) ||
                        formatAction(action).toLowerCase().includes(q)
                    );
                });

                return { module, perms, moduleMatches };
            })
            .filter(
                ({ perms, moduleMatches }) => moduleMatches || perms.length > 0,
            )
            .map(({ module, perms, moduleMatches }) => ({
                module,
                // If module name itself matched, show all perms; otherwise show the filtered subset.
                perms: moduleMatches ? grouped[module] : perms,
            }));
    }, [grouped, q]);

    if (Object.keys(grouped).length === 0) {
        return (
            <div className="py-6 text-center text-xs text-slate-700">
                加载权限列表中...
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="py-6 text-center text-xs text-slate-700">
                未找到匹配的权限
            </div>
        );
    }

    return (
        <div className="max-h-[42vh] space-y-1 overflow-y-auto pr-1">
            {filtered.map(({ module, perms: displayPerms }) => {
                // Module-level toggle operates on ALL perms in the module (not just the
                // filtered subset), so select-all is unambiguous.
                const allPerms = grouped[module];
                const selectedCount = allPerms.filter((p) =>
                    selected.has(p.name),
                ).length;
                const allSelected = selectedCount === allPerms.length;
                const someSelected = selectedCount > 0 && !allSelected;
                const perms = displayPerms;

                return (
                    <div
                        key={module}
                        className="rounded-lg border border-blue-900/25 bg-[#070d1f]/60 px-3 py-2"
                    >
                        <div className="mb-1.5 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    onToggleModule(module, !allSelected)
                                }
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
                            <span className="text-xs font-medium text-slate-400">
                                {formatModule(module)}
                            </span>
                            <span className="ml-auto text-[10px] text-slate-700">
                                {selectedCount}/{allPerms.length}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-6">
                            {perms.map((p) => {
                                const action = p.name
                                    .split('.')
                                    .slice(1)
                                    .join('.');
                                const active = selected.has(p.name);

                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => onToggle(p.name)}
                                        className={cn(
                                            'rounded border px-2 py-0.5 text-[11px] transition-colors',
                                            active
                                                ? 'border-blue-500/35 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                                                : 'border-blue-900/30 bg-transparent text-slate-600 hover:border-blue-800/50 hover:text-slate-400',
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

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed';
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
    wide,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
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
            <div
                className={cn(
                    'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60',
                    wide ? 'max-w-2xl' : 'max-w-lg',
                )}
            >
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
