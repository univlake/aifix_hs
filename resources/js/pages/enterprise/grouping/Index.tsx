import { Head } from '@inertiajs/react';
import {
    Layers,
    Building2,
    AlertTriangle,
    ChevronRight,
    ChevronDown,
    Plus,
    Pencil,
    Trash2,
    X,
    Users,
    Check,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────

interface TreeNode {
    id: number;
    title: string;
    status: number;
    pid: number;
    companies?: TreeNode[];
}

interface GroupCompany {
    id: number;
    title: string;
    status: number;
}

interface CompanyGroup {
    id: number;
    name: string;
    company_id: number;
    kid_companies: GroupCompany[];
}

// ── Main page ─────────────────────────────────────────────────────

export default function EnterpriseGrouping() {
    const { rootCompany } = useScope();
    const { canWrite } = usePermission();
    const canCreate = canWrite('company-groups.create');
    const canUpdate = canWrite('company-groups.update');
    const canDelete = canWrite('company-groups.delete');

    // Tree state
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [treeLoading, setTreeLoading] = useState(true);
    const [treeError, setTreeError] = useState('');

    // Group state
    const [groups, setGroups] = useState<CompanyGroup[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);

    // Group form state
    const [createOpen, setCreateOpen] = useState(false);
    const [editGroup, setEditGroup] = useState<CompanyGroup | null>(null);
    const [groupName, setGroupName] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteGroup, setDeleteGroup] = useState<CompanyGroup | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Member management state
    const [memberGroup, setMemberGroup] = useState<CompanyGroup | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [syncingMembers, setSyncingMembers] = useState(false);

    // ── Fetch tree scoped to root company ────────────────────────
    useEffect(() => {
        if (!rootCompany?.id) {
            return;
        }

        setTreeLoading(true);
        api.get('/companies-tree', { params: { pid: rootCompany.id } })
            .then((res) => setTree(res.data.data ?? []))
            .catch(() => setTreeError('加载企业层级失败'))
            .finally(() => setTreeLoading(false));
    }, [rootCompany?.id]);

    // ── Fetch groups ─────────────────────────────────────────────
    const fetchGroups = useCallback(() => {
        if (!rootCompany?.id) {
            return;
        }

        setGroupsLoading(true);
        api.get('/company-groups', { params: { company_id: rootCompany.id } })
            .then((res) => setGroups(res.data.data ?? []))
            .catch(() => {})
            .finally(() => setGroupsLoading(false));
    }, [rootCompany?.id]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // ── Group CRUD ───────────────────────────────────────────────
    const handleCreateOpen = () => {
        setGroupName('');
        setCreateOpen(true);
    };

    const handleCreate = async () => {
        if (!groupName.trim() || !rootCompany) {
            return;
        }

        setSaving(true);

        try {
            await api.post('/company-groups', {
                name: groupName.trim(),
                company_id: rootCompany.id,
            });
            setCreateOpen(false);
            fetchGroups();
        } finally {
            setSaving(false);
        }
    };

    const handleEditOpen = (g: CompanyGroup) => {
        setEditGroup(g);
        setGroupName(g.name);
    };

    const handleEdit = async () => {
        if (!editGroup || !groupName.trim()) {
            return;
        }

        setSaving(true);

        try {
            await api.put(`/company-groups/${editGroup.id}`, {
                name: groupName.trim(),
            });
            setEditGroup(null);
            fetchGroups();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteGroup) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/company-groups/${deleteGroup.id}`);
            setDeleteGroup(null);
            fetchGroups();
        } finally {
            setDeleting(false);
        }
    };

    // ── Member management ────────────────────────────────────────
    const openMemberModal = (g: CompanyGroup) => {
        setMemberGroup(g);
        setSelectedIds(new Set(g.kid_companies.map((c) => c.id)));
    };

    const toggleMember = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const handleSyncMembers = async () => {
        if (!memberGroup) {
            return;
        }

        setSyncingMembers(true);

        try {
            await api.post(`/company-groups/${memberGroup.id}/sync-kids`, {
                company_ids: Array.from(selectedIds),
            });
            setMemberGroup(null);
            fetchGroups();
        } finally {
            setSyncingMembers(false);
        }
    };

    // ── Available companies for member modal ─────────────────────
    // Flatten the full hierarchy tree (already fetched for the left panel) so
    // all levels are available, not just direct children from scope subordinates.
    const availableCompanies: GroupCompany[] = rootCompany
        ? (() => {
              const seen = new Set<number>();
              const result: GroupCompany[] = [];
              const visit = (nodes: TreeNode[]) => {
                  for (const n of nodes) {
                      if (!seen.has(n.id)) {
                          seen.add(n.id);
                          result.push({
                              id: n.id,
                              title: n.title,
                              status: n.status,
                          });
                      }

                      if (n.companies?.length) {
                          visit(n.companies);
                      }
                  }
              };
              // Root company first
              seen.add(rootCompany.id);
              result.push({
                  id: rootCompany.id,
                  title: rootCompany.title,
                  status: rootCompany.status,
              });
              visit(tree);

              return result;
          })()
        : [];

    // Build synthetic root node with tree children
    const rootNode: TreeNode | null = rootCompany
        ? {
              id: rootCompany.id,
              title: rootCompany.title,
              status: rootCompany.status,
              pid: 0,
              companies: tree,
          }
        : null;

    return (
        <>
            <Head title="企业分组" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-100">企业分组</h1>
                <p className="mt-1 text-sm text-slate-500">
                    查看企业层级结构，管理自定义分组
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* ── Left: Hierarchy tree ── */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                                <Layers className="h-4 w-4 text-blue-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-200">
                                企业层级结构
                            </h2>
                        </div>

                        {treeError && (
                            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {treeError}
                            </div>
                        )}

                        {treeLoading && <TreeSkeleton />}

                        {!treeLoading && rootNode && (
                            <div className="space-y-0.5">
                                <TreeItem node={rootNode} depth={0} />
                            </div>
                        )}

                        {!treeLoading && !rootNode && !treeError && (
                            <div className="py-10 text-center text-slate-600">
                                <Building2 className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                <p className="text-xs">暂无层级数据</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Custom groups ── */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-600/20 bg-violet-600/15">
                                    <Users className="h-4 w-4 text-violet-400" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-200">
                                    自定义分组
                                </h2>
                                <span className="rounded-md bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                                    {groups.length}
                                </span>
                            </div>
                            {canCreate && (
                                <button
                                    onClick={handleCreateOpen}
                                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 transition-all hover:bg-blue-600/25"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    新增分组
                                </button>
                            )}
                        </div>

                        {groupsLoading && (
                            <div className="animate-pulse space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 rounded-xl border border-blue-900/20 bg-blue-900/10"
                                    />
                                ))}
                            </div>
                        )}

                        {!groupsLoading && groups.length === 0 && (
                            <div className="py-14 text-center text-slate-600">
                                <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                <p className="text-xs">
                                    暂无分组，点击上方新增
                                </p>
                            </div>
                        )}

                        {!groupsLoading && groups.length > 0 && (
                            <div className="space-y-2.5">
                                {groups.map((g) => (
                                    <GroupCard
                                        key={g.id}
                                        group={g}
                                        canUpdate={canUpdate}
                                        canDelete={canDelete}
                                        onEdit={() => handleEditOpen(g)}
                                        onDelete={() => setDeleteGroup(g)}
                                        onManageMembers={() =>
                                            openMemberModal(g)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Create group modal ── */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
                <ModalHeader
                    title="新增分组"
                    subtitle="创建一个自定义企业分组"
                    onClose={() => setCreateOpen(false)}
                />
                <div className="p-5">
                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                        分组名称<span className="ml-1 text-blue-500">*</span>
                    </label>
                    <input
                        autoFocus
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="请输入分组名称"
                        className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                    />
                </div>
                <ModalFooter
                    onCancel={() => setCreateOpen(false)}
                    onConfirm={handleCreate}
                    loading={saving}
                    confirmLabel="创建"
                />
            </Modal>

            {/* ── Edit group modal ── */}
            <Modal open={!!editGroup} onClose={() => setEditGroup(null)}>
                <ModalHeader
                    title="编辑分组"
                    subtitle={`修改分组「${editGroup?.name}」的名称`}
                    onClose={() => setEditGroup(null)}
                />
                <div className="p-5">
                    <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                        分组名称<span className="ml-1 text-blue-500">*</span>
                    </label>
                    <input
                        autoFocus
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                        placeholder="请输入分组名称"
                        className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                    />
                </div>
                <ModalFooter
                    onCancel={() => setEditGroup(null)}
                    onConfirm={handleEdit}
                    loading={saving}
                    confirmLabel="保存"
                />
            </Modal>

            {/* ── Delete confirm modal ── */}
            <Modal open={!!deleteGroup} onClose={() => setDeleteGroup(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除分组
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除分组 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteGroup?.name}
                        </span>
                        &rdquo; 吗？该分组的成员配置将一并删除，此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteGroup(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {deleting && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {deleting ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>

            {/* ── Manage members modal ── */}
            <Modal
                open={!!memberGroup}
                onClose={() => setMemberGroup(null)}
                wide
            >
                <ModalHeader
                    title={`管理成员 · ${memberGroup?.name}`}
                    subtitle="选择加入此分组的企业"
                    onClose={() => setMemberGroup(null)}
                />
                <div className="max-h-[50vh] overflow-y-auto p-5">
                    {availableCompanies.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-600">
                            暂无可选企业
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {availableCompanies.map((c) => {
                                const checked = selectedIds.has(c.id);

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleMember(c.id)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                                            checked
                                                ? 'border-blue-500/30 bg-blue-600/10 text-slate-200'
                                                : 'border-blue-900/20 bg-transparent text-slate-400 hover:border-blue-900/40 hover:text-slate-300',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                                                checked
                                                    ? 'border-blue-500 bg-blue-600'
                                                    : 'border-slate-700 bg-transparent',
                                            )}
                                        >
                                            {checked && (
                                                <Check className="h-2.5 w-2.5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-blue-900/30 bg-blue-600/8">
                                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                        </div>
                                        <span className="flex-1 truncate">
                                            {c.title}
                                        </span>
                                        {c.status === 1 && (
                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-blue-900/30 px-5 py-3.5">
                    <p className="text-xs text-slate-600">
                        已选{' '}
                        <span className="font-medium text-slate-400">
                            {selectedIds.size}
                        </span>{' '}
                        家企业
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setMemberGroup(null)}
                            className="rounded-lg border border-blue-900/40 px-3.5 py-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSyncMembers}
                            disabled={syncingMembers}
                            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3.5 py-1.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {syncingMembers && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {syncingMembers ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// ── Tree components ───────────────────────────────────────────────

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
    const hasChildren = (node.companies?.length ?? 0) > 0;
    const [expanded, setExpanded] = useState(depth === 0);
    const paddingLeft = depth * 18 + 10;

    const statusDot: Record<number, string> = {
        0: 'bg-amber-400',
        1: 'bg-emerald-400',
        2: 'bg-slate-500',
    };

    return (
        <div>
            <div
                className="group flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 transition-colors hover:bg-blue-600/8"
                style={{ paddingLeft }}
                onClick={() => hasChildren && setExpanded((v) => !v)}
            >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {hasChildren ? (
                        expanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )
                    ) : (
                        <span className="h-1 w-1 rounded-full bg-blue-900/60" />
                    )}
                </div>
                <div
                    className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                        depth === 0
                            ? 'border-blue-600/20 bg-blue-600/15'
                            : 'border-blue-900/30 bg-slate-800/60',
                    )}
                >
                    <Building2
                        className={cn(
                            'h-3 w-3',
                            depth === 0 ? 'text-blue-400' : 'text-slate-500',
                        )}
                    />
                </div>
                <span
                    className={cn(
                        'flex-1 truncate text-sm font-medium',
                        depth === 0 ? 'text-slate-200' : 'text-slate-400',
                    )}
                >
                    {node.title}
                </span>
                <span
                    className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        statusDot[node.status] ?? 'bg-slate-600',
                    )}
                />
                {hasChildren && (
                    <span className="shrink-0 rounded-md bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                        {node.companies!.length}
                    </span>
                )}
            </div>
            {expanded && hasChildren && (
                <div>
                    {node.companies!.map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function TreeSkeleton() {
    return (
        <div className="animate-pulse space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 py-2"
                    style={{ paddingLeft: i > 0 ? 28 : 10 }}
                >
                    <div className="h-4 w-4 rounded bg-slate-800" />
                    <div className="h-6 w-6 rounded-md bg-slate-800" />
                    <div
                        className="h-3.5 rounded bg-slate-800"
                        style={{ width: `${90 + i * 25}px` }}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Group card ────────────────────────────────────────────────────

function GroupCard({
    group,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
    onManageMembers,
}: {
    group: CompanyGroup;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onManageMembers: () => void;
}) {
    return (
        <div className="rounded-xl border border-blue-900/30 bg-[#070d1f]/60 p-4 transition-colors hover:border-blue-900/50">
            <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">
                        {group.name}
                    </span>
                    <span className="rounded-md border border-violet-900/40 bg-violet-600/8 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
                        {group.kid_companies.length} 家
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    {canUpdate && (
                        <IconBtn
                            title="管理成员"
                            onClick={onManageMembers}
                            className="text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                        >
                            <Users className="h-3.5 w-3.5" />
                        </IconBtn>
                    )}
                    {canUpdate && (
                        <IconBtn
                            title="编辑名称"
                            onClick={onEdit}
                            className="text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </IconBtn>
                    )}
                    {canDelete && (
                        <IconBtn
                            title="删除分组"
                            onClick={onDelete}
                            className="text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                    )}
                </div>
            </div>
            {group.kid_companies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {group.kid_companies.map((c) => (
                        <span
                            key={c.id}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-900/30 bg-blue-900/20 px-2 py-0.5 text-xs text-slate-400"
                        >
                            <Building2 className="h-2.5 w-2.5" />
                            {c.title}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-700">
                    暂无成员企业，点击右上角管理成员
                </p>
            )}
        </div>
    );
}

// ── Shared sub-components ─────────────────────────────────────────

function Modal({
    open,
    onClose,
    children,
    wide = false,
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
                    'relative overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60',
                    wide ? 'w-full max-w-lg' : 'w-full max-w-md',
                )}
            >
                {children}
            </div>
        </div>
    );
}

function ModalHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-5 py-4">
            <div>
                <h2 className="text-sm font-semibold text-slate-100">
                    {title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
            </div>
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
    confirmLabel,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
    confirmLabel: string;
}) {
    return (
        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-5 py-3.5">
            <button
                onClick={onCancel}
                className="rounded-lg border border-blue-900/40 px-3.5 py-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
                取消
            </button>
            <button
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3.5 py-1.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
            >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? '处理中...' : confirmLabel}
            </button>
        </div>
    );
}

function IconBtn({
    children,
    onClick,
    title,
    className,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title?: string;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                className,
            )}
        >
            {children}
        </button>
    );
}
