import { Head } from '@inertiajs/react';
import {
    Loader2,
    Plus,
    Trash2,
    X,
    AlertTriangle,
    Users,
    Search,
    Mail,
    Phone,
    Building2,
    UserCheck,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface ExpertUser {
    id: number;
    nickname: string;
    phone?: string;
    department_name?: string;
    email?: string;
}

interface Expert {
    id: number;
    expert_user_id: number;
    company_id: number;
    user: ExpertUser;
    created_at: string;
}

// ── Page ──────────────────────────────────────────────────────────

export default function ExpertsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [search, setSearch] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Expert | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { canWrite } = usePermission();
    const canCreate = canWrite('bloc-experts.create');
    const canDelete = canWrite('bloc-experts.delete');

    const crud = useApiCrud('/bloc-experts');

    const {
        data: experts,
        loading,
        total,
        reload,
        search: doSearch,
    } = useApiList<Expert>({
        endpoint: '/bloc-experts',
        defaultParams: companyId ? { company_id: companyId } : {},
        enabled: !!companyId,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (companyId) {
            doSearch({ company_id: companyId, nickname: search || undefined });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        setDeleteLoading(true);

        try {
            await crud.remove(deleteTarget.id);
            setDeleteTarget(null);
            reload();
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleAdded = () => {
        setAddOpen(false);
        reload();
    };

    return (
        <>
            <Head title="专家库" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-100">专家库</h1>
                <p className="mt-1 text-sm text-slate-500">
                    管理企业安全生产专家信息，记录专家资质及领域专长
                </p>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索专家姓名..."
                            className="h-9 w-56 rounded-lg border border-blue-900/40 bg-[#0a1428] pr-3 pl-9 text-sm text-slate-300 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-9 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        搜索
                    </button>
                </form>

                {canCreate && (
                    <button
                        onClick={() => setAddOpen(true)}
                        disabled={!companyId}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        添加专家
                    </button>
                )}
            </div>

            {/* Count */}
            {!loading && (
                <p className="mb-3 text-xs text-slate-600">
                    共 <span className="text-slate-400">{total}</span> 位专家
                </p>
            )}

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : experts.length === 0 ? (
                <EmptyState
                    onAdd={() => setAddOpen(true)}
                    canCreate={canCreate}
                />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {experts.map((expert) => (
                        <ExpertCard
                            key={expert.id}
                            expert={expert}
                            onDelete={() => setDeleteTarget(expert)}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add Expert modal */}
            {addOpen && companyId && (
                <AddExpertModal
                    companyId={companyId}
                    onClose={() => setAddOpen(false)}
                    onAdded={handleAdded}
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    />
                    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl">
                        <div className="p-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <h2 className="mb-1 text-base font-semibold text-slate-100">
                                确认移除
                            </h2>
                            <p className="text-sm text-slate-500">
                                确定要将{' '}
                                <span className="font-medium text-slate-300">
                                    {deleteTarget.user?.nickname}
                                </span>{' '}
                                从专家库中移除吗？
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {deleteLoading && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                确认移除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Expert Card ───────────────────────────────────────────────────

function ExpertCard({
    expert,
    onDelete,
    canDelete,
}: {
    expert: Expert;
    onDelete: () => void;
    canDelete: boolean;
}) {
    const user = expert.user;
    const initials = user?.nickname ? user.nickname.slice(-2) : '??';

    return (
        <div className="group relative rounded-xl border border-blue-900/30 bg-[#0d1530] p-5 transition-colors hover:border-blue-800/50">
            {/* Remove button */}
            {canDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600/10 hover:text-red-400"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Avatar + Name */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-semibold text-violet-300">
                    {initials}
                </div>
                <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-100">
                        {user?.nickname ?? '—'}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-violet-400" />
                        <span className="text-xs text-violet-400">
                            安全专家
                        </span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
                {user?.department_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                        <span className="truncate">{user.department_name}</span>
                    </div>
                )}
                {user?.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                        <span>{user.phone}</span>
                    </div>
                )}
                {user?.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                        <span className="truncate">{user.email}</span>
                    </div>
                )}
                {!user?.department_name && !user?.phone && !user?.email && (
                    <p className="text-xs text-slate-700">暂无联系信息</p>
                )}
            </div>

            {/* Join date */}
            {expert.created_at && (
                <div className="mt-4 border-t border-blue-900/20 pt-3 text-xs text-slate-700">
                    加入时间：{expert.created_at.slice(0, 10)}
                </div>
            )}
        </div>
    );
}

// ── Add Expert Modal ──────────────────────────────────────────────

function AddExpertModal({
    companyId,
    onClose,
    onAdded,
}: {
    companyId: number;
    onClose: () => void;
    onAdded: () => void;
}) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<ExpertUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [adding, setAdding] = useState<number | null>(null);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(
        async (nickname?: string) => {
            setLoadingUsers(true);
            setError('');

            try {
                const { data: res } = await api.get<ApiResponse<ExpertUser[]>>(
                    '/bloc-experts-list',
                    {
                        params: {
                            company_id: companyId,
                            nickname: nickname || undefined,
                        },
                    },
                );
                setUsers(Array.isArray(res.data) ? res.data : []);
            } catch {
                setError('加载用户列表失败');
            } finally {
                setLoadingUsers(false);
            }
        },
        [companyId],
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(query);
    };

    const handleAdd = async (user: ExpertUser) => {
        setAdding(user.id);
        setError('');

        try {
            await api.post('/bloc-experts', {
                company_id: companyId,
                expert_user_id: user.id,
            });
            onAdded();
        } catch (err: unknown) {
            setError(getErrorMessage(err, '添加失败，请重试'));
            setAdding(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl"
                style={{ maxHeight: '80vh' }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-blue-900/30 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            添加专家
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            从系统用户中选择并添加为专家
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-600 transition-colors hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="shrink-0 border-b border-blue-900/20 px-5 py-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="搜索用户姓名..."
                                className="h-9 w-full rounded-lg border border-blue-900/40 bg-[#0a1428] pr-3 pl-9 text-sm text-slate-300 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-9 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                        >
                            搜索
                        </button>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-3 flex shrink-0 items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* User list */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loadingUsers ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-600">
                            <Users className="h-6 w-6" />
                            <p className="text-sm">没有可添加的用户</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-blue-900/20">
                            {users.map((user) => (
                                <li
                                    key={user.id}
                                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-blue-900/10"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-semibold text-violet-300">
                                            {user.nickname.slice(-2)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-slate-200">
                                                {user.nickname}
                                            </div>
                                            <div className="truncate text-xs text-slate-600">
                                                {[
                                                    user.department_name,
                                                    user.phone,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ') || '暂无信息'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(user)}
                                        disabled={adding === user.id}
                                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {adding === user.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Plus className="h-3 w-3" />
                                        )}
                                        添加
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Shared primitives ─────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-blue-900/30 bg-[#0d1530] p-5"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-11 w-11 animate-pulse rounded-xl bg-blue-900/30" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-blue-900/30" />
                            <div className="h-3 w-16 animate-pulse rounded bg-blue-900/20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-blue-900/20" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-blue-900/20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({
    onAdd,
    canCreate,
}: {
    onAdd: () => void;
    canCreate: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-900/40 bg-[#0d1530] py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10">
                <Users className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-slate-300">
                暂无专家
            </h3>
            <p className="mb-6 text-sm text-slate-600">
                点击下方按钮，从系统用户中添加安全专家
            </p>
            {canCreate && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/25"
                >
                    <Plus className="h-4 w-4" />
                    添加专家
                </button>
            )}
        </div>
    );
}
