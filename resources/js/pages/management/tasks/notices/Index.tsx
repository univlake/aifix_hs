import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OssDownloadLink } from '@/components/shared/OssDownloadLink';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Variants ──────────────────────────────────────────────────────

type NoticeVariant = 'office' | 'new';

interface VariantConfig {
    label: string;
    endpoint: string;
    scopesKey:
        | 'office_notify_scope'
        | 'new_notify_scope'
        | 'officeNotifyScope'
        | 'newNotifyScope';
    scopeAltKeys: string[];
    scopeReceiverPath: string; // POST path for receiver action
    scopeReceiverLabel: string;
    hasFeedback: boolean; // task type
    hasExcel: boolean;
    emptyLabel: string;
}

const CONFIG: Record<NoticeVariant, VariantConfig> = {
    office: {
        label: '任务型',
        endpoint: '/office-notifies',
        scopesKey: 'office_notify_scope',
        scopeAltKeys: ['officeNotifyScope'],
        scopeReceiverPath: '/office-notify-scopes',
        scopeReceiverLabel: '提交反馈',
        hasFeedback: true,
        hasExcel: true,
        emptyLabel: '暂无任务型通知',
    },
    new: {
        label: '通知型',
        endpoint: '/new-notifies',
        scopesKey: 'new_notify_scope',
        scopeAltKeys: ['newNotifyScope'],
        scopeReceiverPath: '/new-notify-scopes',
        scopeReceiverLabel: '标记已读',
        hasFeedback: false,
        hasExcel: false,
        emptyLabel: '暂无通知型通知',
    },
};

// ── Types ─────────────────────────────────────────────────────────

interface NoticeScopeRow {
    id: number;
    company_id: number;
    company_name: string | null;
    company_group_id: number | null;
    company_group_name: string | null;
    feedback_time?: string | null;
    feedback_status?: string | null;
    feedback_annex_url?: string | null;
    read_time?: string | null;
    read_status?: string | null;
}

interface NoticeRow {
    id: number;
    name: string | null;
    alert_others: string | null;
    comment: string | null;
    annex_url: string | null;
    excel_url?: string | null;
    feedback_time?: string | null;
    company_id: number;
    office_notify_scope?: NoticeScopeRow[];
    officeNotifyScope?: NoticeScopeRow[];
    new_notify_scope?: NoticeScopeRow[];
    newNotifyScope?: NoticeScopeRow[];
}

interface GroupCompany {
    id: number;
    title: string;
    status: number;
}

interface EnterpriseGroup {
    id: number;
    name: string;
    company_id: number;
    kid_companies: GroupCompany[];
}

// ── Helpers ───────────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function fmt(d: string | null | undefined): string {
    return d ? String(d).slice(0, 16) : '—';
}

function pickScopes(n: NoticeRow): NoticeScopeRow[] {
    return (
        n.office_notify_scope ??
        n.officeNotifyScope ??
        n.new_notify_scope ??
        n.newNotifyScope ??
        []
    );
}

function isDone(variant: NoticeVariant, s: NoticeScopeRow): boolean {
    return variant === 'office'
        ? s.feedback_status === '已反馈'
        : s.read_status === '已读';
}

// ── Page ──────────────────────────────────────────────────────────

interface NoticesPageProps {
    receiveOnly?: boolean;
}

export function NoticesPage({ receiveOnly = false }: NoticesPageProps = {}) {
    const [tab, setTab] = useState<NoticeVariant>('office');

    const pageTitle = receiveOnly ? '通知公告' : '通知公告';
    const pageSubtitle = receiveOnly
        ? '查看上级下发的通知公告，按类型完成反馈或阅读确认。'
        : '向下属企业发布通知公告，任务型需附件反馈，通知型仅需确认阅读。';

    return (
        <>
            <Head title={pageTitle} />
            <div className="space-y-4 p-4">
                <header>
                    <h1 className="text-xl font-semibold text-slate-100">
                        {pageTitle}
                    </h1>
                    <p className="text-sm text-slate-400">{pageSubtitle}</p>
                </header>

                <nav className="flex gap-2 border-b border-blue-900/40">
                    <TabButton
                        active={tab === 'office'}
                        onClick={() => setTab('office')}
                    >
                        任务型
                    </TabButton>
                    <TabButton
                        active={tab === 'new'}
                        onClick={() => setTab('new')}
                    >
                        通知型
                    </TabButton>
                </nav>

                <NoticeTab key={tab} variant={tab} receiveOnly={receiveOnly} />
            </div>
        </>
    );
}

export default function ManagementNoticesIndex() {
    return <NoticesPage />;
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative -mb-px px-4 py-2 text-sm transition-colors',
                active
                    ? 'border-b-2 border-blue-400 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300',
            )}
        >
            {children}
        </button>
    );
}

// ── NoticeTab ─────────────────────────────────────────────────────

interface NoticeTabProps {
    variant: NoticeVariant;
    receiveOnly: boolean;
}

function NoticeTab({ variant, receiveOnly }: NoticeTabProps) {
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

// ── ScopeDrawer ───────────────────────────────────────────────────

interface ScopeDrawerProps {
    variant: NoticeVariant;
    notice: NoticeRow;
    scopes: NoticeScopeRow[];
    loading: boolean;
    doneCount: number;
    pendingCount: number;
    onClose: () => void;
    onAdd: () => void;
    onRemove: (s: NoticeScopeRow) => void | Promise<void>;
}

function ScopeDrawer({
    variant,
    notice,
    scopes,
    loading,
    doneCount,
    pendingCount,
    onClose,
    onAdd,
    onRemove,
}: ScopeDrawerProps) {
    const config = CONFIG[variant];

    return (
        <div
            className="fixed inset-0 z-40 flex justify-end bg-black/40"
            onClick={onClose}
        >
            <aside
                className="h-full w-full max-w-3xl overflow-y-auto border-l border-blue-900/40 bg-[#050915] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">
                            {notice.name ?? '通知详情'}
                        </h2>
                        {notice.comment && (
                            <p className="mt-1 text-xs text-slate-400">
                                {notice.comment}
                            </p>
                        )}
                        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                            <div>
                                <dt className="inline text-slate-500">
                                    通知人：
                                </dt>
                                <dd className="inline">
                                    {notice.alert_others ?? '—'}
                                </dd>
                            </div>
                            {config.hasFeedback && (
                                <div>
                                    <dt className="inline text-slate-500">
                                        反馈截止：
                                    </dt>
                                    <dd className="inline">
                                        {fmt(notice.feedback_time)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 p-1 text-slate-400 hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading && (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                )}

                {!loading && (
                    <section>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                                    {config.hasFeedback ? '待反馈' : '未读'}{' '}
                                    {pendingCount}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    {config.hasFeedback ? '已反馈' : '已读'}{' '}
                                    {doneCount}
                                </span>
                            </div>
                            <button
                                onClick={onAdd}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                添加企业
                            </button>
                        </div>
                        {scopes.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                                尚未添加通知企业
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {scopes.map((s) => {
                                    const done = isDone(variant, s);

                                    return (
                                        <li
                                            key={s.id}
                                            className="flex items-center gap-3 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-200">
                                                    {s.company_name ??
                                                        `企业 #${s.company_id}`}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                                    {done ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {config.hasFeedback
                                                                ? `已反馈 ${fmt(s.feedback_time)}`
                                                                : `已读 ${fmt(s.read_time)}`}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-400">
                                                            <Clock className="h-3 w-3" />
                                                            {config.hasFeedback
                                                                ? '待反馈'
                                                                : '未读'}
                                                        </span>
                                                    )}
                                                    {config.hasFeedback &&
                                                        s.feedback_annex_url && (
                                                            <OssDownloadLink
                                                                url={
                                                                    s.feedback_annex_url
                                                                }
                                                                label="反馈附件"
                                                            />
                                                        )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemove(s)}
                                                className="rounded border border-red-500/30 bg-red-600/10 p-1 text-red-400 transition-colors hover:bg-red-600/20"
                                                title="移除"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}
            </aside>
        </div>
    );
}

// ── NoticeFormModal (create + edit) ───────────────────────────────

interface NoticeFormModalProps {
    variant: NoticeVariant;
    companyId: number;
    initial?: NoticeRow;
    onClose: () => void;
    onSaved: () => void;
}

interface GroupSelectionEntry {
    company_id: number;
    company_name: string;
    company_group_id: number;
    company_group_name: string;
}

function NoticeFormModal({
    variant,
    companyId,
    initial,
    onClose,
    onSaved,
}: NoticeFormModalProps) {
    const config = CONFIG[variant];
    const isEdit = !!initial;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        alert_others: initial?.alert_others ?? '',
        comment: initial?.comment ?? '',
        annex_url: initial?.annex_url ?? '',
        excel_url: initial?.excel_url ?? '',
        feedback_time: initial?.feedback_time
            ? String(initial.feedback_time).slice(0, 10)
            : '',
    });

    const [groups, setGroups] = useState<EnterpriseGroup[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(!isEdit);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        new Set(),
    );
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isEdit) {
            return;
        } // Edit keeps existing kids (managed via drawer)

        setGroupsLoading(true);
        api.get<ApiResponse<EnterpriseGroup[]>>('/company-groups', {
            params: { company_id: companyId },
        })
            .then((res) => {
                const list = res.data.data ?? [];
                setGroups(list);
                setExpandedGroups(new Set(list.map((g) => g.id)));
            })
            .catch(() => setGroups([]))
            .finally(() => setGroupsLoading(false));
    }, [companyId, isEdit]);

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const entryKey = (groupId: number, cid: number) => `${groupId}:${cid}`;

    const toggleCompany = (groupId: number, cid: number) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const k = entryKey(groupId, cid);

            if (n.has(k)) {
                n.delete(k);
            } else {
                n.add(k);
            }

            return n;
        });
    };

    const toggleGroup = (g: EnterpriseGroup) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const allSelected = g.kid_companies.every((c) =>
                n.has(entryKey(g.id, c.id)),
            );

            if (allSelected) {
                g.kid_companies.forEach((c) => n.delete(entryKey(g.id, c.id)));
            } else {
                g.kid_companies.forEach((c) => n.add(entryKey(g.id, c.id)));
            }

            return n;
        });
    };

    const toggleExpand = (groupId: number) => {
        setExpandedGroups((prev) => {
            const n = new Set(prev);

            if (n.has(groupId)) {
                n.delete(groupId);
            } else {
                n.add(groupId);
            }

            return n;
        });
    };

    const selectedEntries = useMemo<GroupSelectionEntry[]>(() => {
        const out: GroupSelectionEntry[] = [];

        for (const g of groups) {
            for (const c of g.kid_companies) {
                if (selectedKeys.has(entryKey(g.id, c.id))) {
                    out.push({
                        company_id: c.id,
                        company_name: c.title,
                        company_group_id: g.id,
                        company_group_name: g.name,
                    });
                }
            }
        }

        return out;
    }, [groups, selectedKeys]);

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入标题');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload: Record<string, unknown> = {
                company_id: companyId,
                name: form.name.trim(),
                alert_others: form.alert_others.trim() || null,
                comment: form.comment.trim() || null,
                annex_url: form.annex_url || null,
            };

            if (config.hasFeedback) {
                payload.feedback_time = form.feedback_time || null;
                payload.excel_url = form.excel_url || null;
            }

            if (!isEdit) {
                payload.kids = selectedEntries;
            }

            if (isEdit && initial) {
                await api.put(`${config.endpoint}/${initial.id}`, payload);
            } else {
                await api.post(config.endpoint, payload);
            }

            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '保存失败';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        {isEdit ? '编辑' : '新建'}
                        {config.label}通知
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="标题" required>
                            <input
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="请输入标题"
                            />
                        </Field>
                        <Field label="通知人">
                            <input
                                className={inputCls}
                                value={form.alert_others}
                                onChange={(e) =>
                                    update('alert_others', e.target.value)
                                }
                            />
                        </Field>
                        {config.hasFeedback && (
                            <Field label="反馈截止日期">
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.feedback_time}
                                    onChange={(e) =>
                                        update('feedback_time', e.target.value)
                                    }
                                />
                            </Field>
                        )}
                    </div>
                    <Field label="内容">
                        <textarea
                            className={cn(inputCls, 'min-h-[100px]')}
                            value={form.comment}
                            onChange={(e) => update('comment', e.target.value)}
                        />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="通知附件">
                            <OssUploadField
                                value={form.annex_url}
                                onChange={(url) => update('annex_url', url)}
                            />
                        </Field>
                        {config.hasExcel && (
                            <Field label="收集表地址">
                                <input
                                    type="text"
                                    className={inputCls}
                                    value={form.excel_url}
                                    onChange={(e) =>
                                        update('excel_url', e.target.value)
                                    }
                                    placeholder="请输入收集表地址"
                                />
                            </Field>
                        )}
                    </div>

                    {!isEdit && (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs text-slate-400">
                                    从企业组选择通知对象（已选{' '}
                                    {selectedEntries.length}）
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setSelectedKeys(new Set())}
                                    className="text-xs text-slate-400 hover:text-slate-200"
                                >
                                    清空
                                </button>
                            </div>
                            {groupsLoading ? (
                                <div className="rounded-lg border border-blue-900/40 bg-[#070d1f] py-6 text-center text-slate-500">
                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                </div>
                            ) : groups.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] py-4 text-center text-xs text-slate-500">
                                    尚未创建企业组，请先在「企业分组」中维护。
                                </p>
                            ) : (
                                <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f] p-2">
                                    {groups.map((g) => {
                                        const expanded = expandedGroups.has(
                                            g.id,
                                        );
                                        const selectedInGroup =
                                            g.kid_companies.filter((c) =>
                                                selectedKeys.has(
                                                    entryKey(g.id, c.id),
                                                ),
                                            ).length;
                                        const total = g.kid_companies.length;
                                        const allSelected =
                                            total > 0 &&
                                            selectedInGroup === total;
                                        const partial =
                                            selectedInGroup > 0 &&
                                            selectedInGroup < total;

                                        return (
                                            <li
                                                key={g.id}
                                                className="rounded-md border border-blue-900/30 bg-[#050b1a]"
                                            >
                                                <div className="flex items-center gap-2 px-2 py-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleExpand(g.id)
                                                        }
                                                        className="text-slate-500 hover:text-slate-200"
                                                    >
                                                        {expanded ? (
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                    <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-slate-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                allSelected
                                                            }
                                                            ref={(el) => {
                                                                if (el) {
                                                                    el.indeterminate =
                                                                        partial;
                                                                }
                                                            }}
                                                            onChange={() =>
                                                                toggleGroup(g)
                                                            }
                                                            disabled={
                                                                total === 0
                                                            }
                                                            className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                        />
                                                        <Users className="h-3.5 w-3.5 text-blue-400" />
                                                        <span className="font-medium">
                                                            {g.name}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            ({selectedInGroup}/
                                                            {total})
                                                        </span>
                                                    </label>
                                                </div>
                                                {expanded && total > 0 && (
                                                    <ul className="space-y-1 border-t border-blue-900/30 px-2 py-1.5 pl-8">
                                                        {g.kid_companies.map(
                                                            (c) => (
                                                                <li key={c.id}>
                                                                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-300 hover:bg-blue-900/20">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedKeys.has(
                                                                                entryKey(
                                                                                    g.id,
                                                                                    c.id,
                                                                                ),
                                                                            )}
                                                                            onChange={() =>
                                                                                toggleCompany(
                                                                                    g.id,
                                                                                    c.id,
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                                        />
                                                                        {
                                                                            c.title
                                                                        }
                                                                    </label>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || !form.name.trim()}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存
                    </button>
                </footer>
            </div>
        </div>
    );
}

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
        <label className="block text-xs text-slate-400">
            <span className="mb-1 block">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </span>
            {children}
        </label>
    );
}

// ── AddCompanyModal ───────────────────────────────────────────────

interface AddCompanyModalProps {
    variant: NoticeVariant;
    notice: NoticeRow;
    existing: NoticeScopeRow[];
    onClose: () => void;
    onSaved: () => void;
}

function AddCompanyModal({
    variant,
    notice,
    existing,
    onClose,
    onSaved,
}: AddCompanyModalProps) {
    const config = CONFIG[variant];
    const { subordinates } = useScope();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const existingIds = useMemo(
        () => new Set(existing.map((s) => s.company_id)),
        [existing],
    );
    const available = useMemo(
        () => subordinates.filter((c) => !existingIds.has(c.id)),
        [subordinates, existingIds],
    );

    const toggle = (id: number) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);

            if (n.has(id)) {
                n.delete(id);
            } else {
                n.add(id);
            }

            return n;
        });
    };

    const save = async () => {
        if (selectedIds.size === 0) {
            return;
        }

        setSaving(true);

        try {
            const kids = [
                ...existing.map((s) => ({
                    company_id: s.company_id,
                    company_name: s.company_name,
                    company_group_id: s.company_group_id,
                    company_group_name: s.company_group_name,
                })),
                ...subordinates
                    .filter((c) => selectedIds.has(c.id))
                    .map((c) => ({ company_id: c.id, company_name: c.title })),
            ];
            await api.put(`${config.endpoint}/${notice.id}`, { kids });
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        添加通知企业
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>
                {available.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                        所有下属企业已添加
                    </p>
                ) : (
                    <ul className="max-h-80 space-y-1 overflow-y-auto">
                        {available.map((c) => (
                            <li key={c.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-900/30 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 hover:border-blue-500/40">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(c.id)}
                                        onChange={() => toggle(c.id)}
                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                    />
                                    {c.title}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={selectedIds.size === 0 || saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存 ({selectedIds.size})
                    </button>
                </footer>
            </div>
        </div>
    );
}

// ── DeleteNoticeModal ─────────────────────────────────────────────

interface DeleteNoticeModalProps {
    notice: NoticeRow;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

function DeleteNoticeModal({
    notice,
    loading,
    onCancel,
    onConfirm,
}: DeleteNoticeModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-xl border border-blue-900/40 bg-[#050915] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除通知
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {notice.name ?? `#${notice.id}`}
                        </span>
                        &rdquo; 吗？此操作不可撤销，将同时清除所有通知记录。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-40"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => void onConfirm()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── SubmitFeedbackModal ───────────────────────────────────────────

interface SubmitFeedbackModalProps {
    scope: NoticeScopeRow;
    notice: NoticeRow;
    onClose: () => void;
    onSaved: () => void;
}

function SubmitFeedbackModal({
    scope,
    notice,
    onClose,
    onSaved,
}: SubmitFeedbackModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [annexUrl, setAnnexUrl] = useState('');

    const save = async () => {
        if (!annexUrl) {
            setError('请上传反馈附件');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post(`/office-notify-scopes/${scope.id}/feedback`, {
                feedback_annex_url: annexUrl,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '提交失败';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            提交任务反馈
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {notice.name ?? ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <Field label="反馈附件" required>
                    <OssUploadField value={annexUrl} onChange={setAnnexUrl} />
                </Field>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || !annexUrl}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        提交反馈
                    </button>
                </footer>
            </div>
        </div>
    );
}
