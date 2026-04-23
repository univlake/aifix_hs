import {
    CheckCircle2,
    Clock,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { ScopeDrawer } from './drawers/ScopeDrawer';
import { AddCompanyModal } from './modals/AddCompanyModal';
import { DeleteNoticeModal } from './modals/DeleteNoticeModal';
import { NoticeFormModal } from './modals/NoticeFormModal';
import { SubmitFeedbackModal } from './modals/SubmitFeedbackModal';
import {
    CONFIG,
    fmt,
    inputCls,
    isDone,
    pickScopes,
    type NoticeRow,
    type NoticeScopeRow,
    type NoticeVariant,
} from './types';

interface NoticeTabProps {
    variant: NoticeVariant;
    receiveOnly: boolean;
}

export function NoticeTab({ variant, receiveOnly }: NoticeTabProps) {
    const config = CONFIG[variant];
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [rows, setRows] = useState<NoticeRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');

    const [selected, setSelected] = useState<NoticeRow | null>(null);
    const [drawerScopes, setDrawerScopes] = useState<NoticeScopeRow[]>([]);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<NoticeRow | null>(null);
    const [deleting, setDeleting] = useState<NoticeRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const [receiverActionFor, setReceiverActionFor] = useState<{
        notice: NoticeRow;
        scope: NoticeScopeRow;
    } | null>(null);
    const [markingReadId, setMarkingReadId] = useState<number | null>(null);

    const fetchRows = useCallback(
        async (p: number, q: string) => {
            if (!companyId) {
                return;
            }

            setLoading(true);

            try {
                const res = await api.get<
                    ApiResponse<PaginatedData<NoticeRow>>
                >(config.endpoint, {
                    params: {
                        company_id: companyId,
                        page: p,
                        per_page: 15,
                        ...(q ? { name: q } : {}),
                    },
                });
                setRows(res.data.data.data);
                setLastPage(res.data.data.last_page);
                setPage(res.data.data.current_page);
            } finally {
                setLoading(false);
            }
        },
        [companyId, config.endpoint],
    );

    useEffect(() => {
        fetchRows(1, search);
    }, [companyId, search, fetchRows]);

    const openDrawer = useCallback(
        async (n: NoticeRow) => {
            setSelected(n);
            setDrawerLoading(true);

            try {
                const res = await api.get<ApiResponse<NoticeRow>>(
                    `${config.endpoint}/${n.id}`,
                );
                setDrawerScopes(pickScopes(res.data.data));
            } finally {
                setDrawerLoading(false);
            }
        },
        [config.endpoint],
    );

    const closeDrawer = useCallback(() => {
        setSelected(null);
        setDrawerScopes([]);
    }, []);

    const reloadDrawer = useCallback(async () => {
        if (!selected) {
            return;
        }

        const res = await api.get<ApiResponse<NoticeRow>>(
            `${config.endpoint}/${selected.id}`,
        );
        setDrawerScopes(pickScopes(res.data.data));
    }, [selected, config.endpoint]);

    const handleRemoveScope = useCallback(
        async (s: NoticeScopeRow) => {
            if (!selected) {
                return;
            }

            if (
                !confirm(
                    `移除企业 "${s.company_name ?? s.company_id}" 的通知？`,
                )
            ) {
                return;
            }

            const kids = drawerScopes
                .filter((x) => x.id !== s.id)
                .map((x) => ({
                    company_id: x.company_id,
                    company_name: x.company_name,
                    company_group_id: x.company_group_id,
                    company_group_name: x.company_group_name,
                }));
            await api.put(`${config.endpoint}/${selected.id}`, { kids });
            await reloadDrawer();
        },
        [selected, drawerScopes, config.endpoint, reloadDrawer],
    );

    const handleDelete = useCallback(async () => {
        if (!deleting) {
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete(`${config.endpoint}/${deleting.id}`);
            setDeleting(null);
            await fetchRows(page, search);
        } finally {
            setDeleteLoading(false);
        }
    }, [deleting, fetchRows, page, search, config.endpoint]);

    const handleMarkRead = useCallback(
        async (scope: NoticeScopeRow) => {
            setMarkingReadId(scope.id);

            try {
                await api.post(`${config.scopeReceiverPath}/${scope.id}/read`);
                await fetchRows(page, search);
            } finally {
                setMarkingReadId(null);
            }
        },
        [config.scopeReceiverPath, fetchRows, page, search],
    );

    const doneCount = useMemo(
        () => drawerScopes.filter((s) => isDone(variant, s)).length,
        [drawerScopes, variant],
    );
    const pendingCount = drawerScopes.length - doneCount;

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <input
                    type="search"
                    placeholder="搜索标题..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(inputCls, 'max-w-xs')}
                />
                {!receiveOnly && (
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        disabled={!companyId}
                        className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-6 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                        新建{config.label}
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                        <tr>
                            <th className="px-4 py-3">标题</th>
                            {config.hasFeedback && (
                                <th className="w-32 px-4 py-3">反馈截止</th>
                            )}
                            <th className="w-32 px-4 py-3">通知数</th>
                            <th className="w-32 px-4 py-3">
                                {config.hasFeedback ? '已反馈' : '已读'}
                            </th>
                            <th className="w-32 px-4 py-3">附件</th>
                            <th className="w-64 px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && (
                            <tr>
                                <td
                                    colSpan={config.hasFeedback ? 6 : 5}
                                    className="px-4 py-6 text-center text-slate-500"
                                >
                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                </td>
                            </tr>
                        )}
                        {!loading && rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={config.hasFeedback ? 6 : 5}
                                    className="px-4 py-6 text-center text-slate-500"
                                >
                                    {config.emptyLabel}
                                </td>
                            </tr>
                        )}
                        {rows.map((n) => {
                            const scopes = pickScopes(n);
                            const done = scopes.filter((s) =>
                                isDone(variant, s),
                            ).length;
                            const isOrganizer =
                                !!companyId && n.company_id === companyId;
                            const ownScope =
                                scopes.find(
                                    (s) => s.company_id === companyId,
                                ) ?? null;
                            const ownDone = ownScope
                                ? isDone(variant, ownScope)
                                : false;

                            return (
                                <tr
                                    key={n.id}
                                    className="text-slate-200 hover:bg-blue-950/30"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {n.name ?? '—'}
                                            </span>
                                            {!isOrganizer && (
                                                <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
                                                    受发
                                                </span>
                                            )}
                                        </div>
                                        {n.alert_others && (
                                            <div className="text-xs text-slate-500">
                                                通知人：{n.alert_others}
                                            </div>
                                        )}
                                        {!isOrganizer && ownScope && (
                                            <div className="mt-1 text-[11px] text-slate-500">
                                                {ownDone ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-400">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {config.hasFeedback
                                                            ? `已反馈 ${fmt(ownScope.feedback_time)}`
                                                            : `已读 ${fmt(ownScope.read_time)}`}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-400">
                                                        <Clock className="h-3 w-3" />
                                                        {config.hasFeedback
                                                            ? '待反馈'
                                                            : '未读'}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    {config.hasFeedback && (
                                        <td className="px-4 py-3 text-slate-400">
                                            {fmt(n.feedback_time)}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-slate-400">
                                        {scopes.length}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {done}/{scopes.length}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {n.annex_url ? (
                                            <OssDownloadLink
                                                url={n.annex_url}
                                                label="查看"
                                            />
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-0.5">
                                            {isOrganizer ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDrawer(n)
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        管理
                                                    </button>
                                                    {!receiveOnly && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setEditing(
                                                                        n,
                                                                    )
                                                                }
                                                                title="编辑"
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-600/10 hover:text-blue-400"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleting(
                                                                        n,
                                                                    )
                                                                }
                                                                title="删除"
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {ownScope &&
                                                        !ownDone &&
                                                        (config.hasFeedback ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setReceiverActionFor(
                                                                        {
                                                                            notice: n,
                                                                            scope: ownScope,
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-600/20"
                                                            >
                                                                <Upload className="h-3.5 w-3.5" />
                                                                提交反馈
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMarkRead(
                                                                        ownScope,
                                                                    )
                                                                }
                                                                disabled={
                                                                    markingReadId ===
                                                                    ownScope.id
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-600/20 disabled:opacity-40"
                                                            >
                                                                {markingReadId ===
                                                                ownScope.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                )}
                                                                标记已读
                                                            </button>
                                                        ))}
                                                    {ownScope &&
                                                        ownDone &&
                                                        config.hasFeedback &&
                                                        ownScope.feedback_annex_url && (
                                                            <OssDownloadLink
                                                                url={
                                                                    ownScope.feedback_annex_url
                                                                }
                                                                label="查看反馈"
                                                            />
                                                        )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 && (
                <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                    <button
                        onClick={() => fetchRows(page - 1, search)}
                        disabled={page <= 1}
                        className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                    >
                        上一页
                    </button>
                    <span>
                        {page} / {lastPage}
                    </span>
                    <button
                        onClick={() => fetchRows(page + 1, search)}
                        disabled={page >= lastPage}
                        className="rounded border border-blue-900/40 px-2 py-1 disabled:opacity-40"
                    >
                        下一页
                    </button>
                </div>
            )}

            {selected && (
                <ScopeDrawer
                    variant={variant}
                    notice={selected}
                    scopes={drawerScopes}
                    loading={drawerLoading}
                    doneCount={doneCount}
                    pendingCount={pendingCount}
                    onClose={closeDrawer}
                    onAdd={() => setAddOpen(true)}
                    onRemove={handleRemoveScope}
                />
            )}

            {addOpen && selected && (
                <AddCompanyModal
                    variant={variant}
                    notice={selected}
                    existing={drawerScopes}
                    onClose={() => setAddOpen(false)}
                    onSaved={async () => {
                        setAddOpen(false);
                        await reloadDrawer();
                        await fetchRows(page, search);
                    }}
                />
            )}

            {createOpen && companyId && (
                <NoticeFormModal
                    variant={variant}
                    companyId={companyId}
                    onClose={() => setCreateOpen(false)}
                    onSaved={async () => {
                        setCreateOpen(false);
                        await fetchRows(1, search);
                    }}
                />
            )}

            {editing && companyId && (
                <NoticeFormModal
                    variant={variant}
                    companyId={companyId}
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await fetchRows(page, search);
                    }}
                />
            )}

            {deleting && (
                <DeleteNoticeModal
                    notice={deleting}
                    loading={deleteLoading}
                    onCancel={() => setDeleting(null)}
                    onConfirm={handleDelete}
                />
            )}

            {receiverActionFor && (
                <SubmitFeedbackModal
                    scope={receiverActionFor.scope}
                    notice={receiverActionFor.notice}
                    onClose={() => setReceiverActionFor(null)}
                    onSaved={async () => {
                        setReceiverActionFor(null);
                        await fetchRows(page, search);
                    }}
                />
            )}
        </>
    );
}
