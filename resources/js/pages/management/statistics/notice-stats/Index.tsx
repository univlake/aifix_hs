import { Head } from '@inertiajs/react';
import {
    BarChart3,
    ClipboardList,
    Inbox,
    Loader2,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface StatsRow {
    company_id: number;
    company_name: string;
    office_total: number;
    office_fed_back: number;
    office_pending: number;
    new_total: number;
    new_read: number;
    new_pending: number;
    pending_total: number;
}

interface PendingOfficeItem {
    scope_id: number;
    notice_id: number;
    notice_name: string | null;
    comment: string | null;
    alert_others: string | null;
    feedback_deadline: string | null;
    notice_created_at: string | null;
}

interface PendingNewItem {
    scope_id: number;
    notice_id: number;
    notice_name: string | null;
    comment: string | null;
    alert_others: string | null;
    notice_created_at: string | null;
}

interface PendingResponse {
    office: PendingOfficeItem[];
    new: PendingNewItem[];
}

// ── Page ──────────────────────────────────────────────────────────

export default function NoticeStatsIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [rows, setRows] = useState<StatsRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [viewingPending, setViewingPending] = useState<StatsRow | null>(null);

    const fetchRows = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get<ApiResponse<StatsRow[]>>(
                '/notice-stats/summary',
                {
                    params: { company_id: companyId },
                },
            );
            setRows(res.data.data ?? []);
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '加载失败');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const filtered = useMemo(() => {
        const q = search.trim();

        if (!q) {
            return rows;
        }

        return rows.filter((r) => r.company_name.includes(q));
    }, [rows, search]);

    const totals = useMemo(
        () =>
            rows.reduce(
                (acc, r) => ({
                    office_total: acc.office_total + r.office_total,
                    office_fed_back: acc.office_fed_back + r.office_fed_back,
                    office_pending: acc.office_pending + r.office_pending,
                    new_total: acc.new_total + r.new_total,
                    new_read: acc.new_read + r.new_read,
                    new_pending: acc.new_pending + r.new_pending,
                }),
                {
                    office_total: 0,
                    office_fed_back: 0,
                    office_pending: 0,
                    new_total: 0,
                    new_read: 0,
                    new_pending: 0,
                },
            ),
        [rows],
    );

    return (
        <>
            <Head title="通知公告反馈统计" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-600/15">
                            <BarChart3 className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-100">
                                通知公告反馈统计
                            </h1>
                            <p className="text-sm text-slate-400">
                                按所辖下级企业统计任务型通知的反馈情况与通知型通知的阅读情况。
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                        <input
                            type="search"
                            placeholder="搜索企业名称..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64 rounded-lg border border-blue-900/40 bg-[#070d1f] py-2 pr-3 pl-8 text-sm text-slate-200 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                        />
                    </div>
                </header>

                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard
                        icon={
                            <ClipboardList className="h-4 w-4 text-rose-400" />
                        }
                        label="任务型通知已反馈 / 总数"
                        value={`${totals.office_fed_back} / ${totals.office_total}`}
                        pending={totals.office_pending}
                        pendingLabel="未反馈"
                    />
                    <SummaryCard
                        icon={<Inbox className="h-4 w-4 text-cyan-400" />}
                        label="通知型通知已读 / 总数"
                        value={`${totals.new_read} / ${totals.new_total}`}
                        pending={totals.new_pending}
                        pendingLabel="未读"
                    />
                    <SummaryCard
                        icon={<BarChart3 className="h-4 w-4 text-amber-400" />}
                        label="合计未响应"
                        value={String(
                            totals.office_pending + totals.new_pending,
                        )}
                    />
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-600/8 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                            <tr>
                                <th className="px-4 py-3">企业</th>
                                <th className="w-32 px-4 py-3">任务型已反馈</th>
                                <th className="w-32 px-4 py-3">任务型未反馈</th>
                                <th className="w-32 px-4 py-3">通知型已读</th>
                                <th className="w-32 px-4 py-3">通知型未读</th>
                                <th className="w-32 px-4 py-3">合计未响应</th>
                                <th className="w-40 px-4 py-3 text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    </td>
                                </tr>
                            )}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        暂无数据
                                    </td>
                                </tr>
                            )}
                            {filtered.map((r) => (
                                <tr
                                    key={r.company_id}
                                    className="text-slate-200 hover:bg-blue-950/30"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {r.company_name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        <span className="text-emerald-300">
                                            {r.office_fed_back}
                                        </span>
                                        <span className="text-slate-600">
                                            {' '}
                                            / {r.office_total}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.office_pending > 0 ? (
                                            <span className="text-rose-400">
                                                {r.office_pending}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">
                                                0
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        <span className="text-emerald-300">
                                            {r.new_read}
                                        </span>
                                        <span className="text-slate-600">
                                            {' '}
                                            / {r.new_total}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.new_pending > 0 ? (
                                            <span className="text-amber-400">
                                                {r.new_pending}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">
                                                0
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.pending_total > 0 ? (
                                            <span className="inline-flex items-center rounded border border-rose-500/30 bg-rose-600/10 px-1.5 py-0.5 text-[11px] text-rose-300">
                                                {r.pending_total}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-600/10 px-1.5 py-0.5 text-[11px] text-emerald-300">
                                                已全部响应
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setViewingPending(r)}
                                            disabled={r.pending_total === 0}
                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            未反馈详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingPending && (
                <PendingDrawer
                    subordinate={viewingPending}
                    onClose={() => setViewingPending(null)}
                />
            )}
        </>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    pending,
    pendingLabel,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    pending?: number;
    pendingLabel?: string;
}) {
    return (
        <div className="rounded-xl border border-blue-900/40 bg-[#070d1f] p-4">
            <div className="mb-2 flex items-center gap-2">
                {icon}
                <p className="text-xs text-slate-500">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-slate-100">{value}</p>
            {pending !== undefined && pending > 0 && (
                <p className="mt-1 text-xs text-rose-400">
                    {pendingLabel}：{pending}
                </p>
            )}
        </div>
    );
}

// ── Pending Drawer ────────────────────────────────────────────────

function PendingDrawer({
    subordinate,
    onClose,
}: {
    subordinate: StatsRow;
    onClose: () => void;
}) {
    const [data, setData] = useState<PendingResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<PendingResponse>>('/notice-stats/pending', {
            params: { subordinate_id: subordinate.company_id },
        })
            .then((res) => {
                if (!ignore) {
                    setData(res.data.data);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setData({ office: [], new: [] });
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [subordinate.company_id]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {subordinate.company_name} · 未反馈详情
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            未反馈 {subordinate.office_pending} 条 · 未读{' '}
                            {subordinate.new_pending} 条
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {loading && (
                        <div className="py-10 text-center">
                            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
                        </div>
                    )}

                    {!loading && data && (
                        <>
                            <section>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    任务型通知未反馈 ({data.office.length})
                                </p>
                                {data.office.length === 0 ? (
                                    <p className="text-sm text-slate-600">—</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.office.map((item) => (
                                            <div
                                                key={item.scope_id}
                                                className="rounded-lg border border-rose-500/20 bg-rose-600/5 p-3"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-slate-100">
                                                            {item.notice_name ??
                                                                `任务#${item.notice_id}`}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                            {item.feedback_deadline && (
                                                                <span>
                                                                    反馈截止：
                                                                    {String(
                                                                        item.feedback_deadline,
                                                                    ).slice(
                                                                        0,
                                                                        10,
                                                                    )}
                                                                </span>
                                                            )}
                                                            {item.alert_others && (
                                                                <span>
                                                                    通知人：
                                                                    {
                                                                        item.alert_others
                                                                    }
                                                                </span>
                                                            )}
                                                            {item.notice_created_at && (
                                                                <span>
                                                                    发布：
                                                                    {String(
                                                                        item.notice_created_at,
                                                                    ).slice(
                                                                        0,
                                                                        10,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.comment && (
                                                            <p
                                                                className={cn(
                                                                    'mt-1 line-clamp-2 text-xs text-slate-500',
                                                                )}
                                                                title={
                                                                    item.comment
                                                                }
                                                            >
                                                                {item.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    通知型通知未读 ({data.new.length})
                                </p>
                                {data.new.length === 0 ? (
                                    <p className="text-sm text-slate-600">—</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.new.map((item) => (
                                            <div
                                                key={item.scope_id}
                                                className="rounded-lg border border-cyan-500/20 bg-cyan-600/5 p-3"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Inbox className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-slate-100">
                                                            {item.notice_name ??
                                                                `通知#${item.notice_id}`}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                            {item.alert_others && (
                                                                <span>
                                                                    通知人：
                                                                    {
                                                                        item.alert_others
                                                                    }
                                                                </span>
                                                            )}
                                                            {item.notice_created_at && (
                                                                <span>
                                                                    发布：
                                                                    {String(
                                                                        item.notice_created_at,
                                                                    ).slice(
                                                                        0,
                                                                        10,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.comment && (
                                                            <p
                                                                className={cn(
                                                                    'mt-1 line-clamp-2 text-xs text-slate-500',
                                                                )}
                                                                title={
                                                                    item.comment
                                                                }
                                                            >
                                                                {item.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
