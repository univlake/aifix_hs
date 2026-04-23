import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    MonthStatisticsPage,
    monthFieldGroups,
} from '@/pages/statistics/month-statistics/Index';
import type { MonthStatistic } from '@/pages/statistics/month-statistics/Index';
import type { ApiResponse } from '@/types/models';

type TabKey = 'list' | 'overview';

export default function MonthlyStatsIndex() {
    const [tab, setTab] = useState<TabKey>('list');

    return (
        <>
            <Head title="月度报表统计" />
            <div className="px-4 pt-4">
                <nav className="flex gap-2 border-b border-blue-900/40">
                    <TabButton
                        active={tab === 'list'}
                        onClick={() => setTab('list')}
                    >
                        报表明细
                    </TabButton>
                    <TabButton
                        active={tab === 'overview'}
                        onClick={() => setTab('overview')}
                    >
                        汇总统计
                    </TabButton>
                </nav>
            </div>
            {tab === 'list' ? (
                <MonthStatisticsPage pidMode />
            ) : (
                <div className="space-y-4 p-4">
                    <MonthlyOverview />
                </div>
            )}
        </>
    );
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

// ── Overview ──────────────────────────────────────────────────────

interface MonthTotals extends Partial<MonthStatistic> {
    date: string;
    count_number: number;
    subordinate_count: number;
}

const inputCls =
    'rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function defaultMonth(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function MonthlyOverview() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [dateTime, setDateTime] = useState<string>(defaultMonth());
    const [totals, setTotals] = useState<MonthTotals | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTotals = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get<ApiResponse<MonthTotals>>(
                '/month-statistics/statistics',
                {
                    params: { company_id: companyId, date_time: dateTime },
                },
            );
            setTotals(res.data.data);
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '加载失败');
            setTotals(null);
        } finally {
            setLoading(false);
        }
    }, [companyId, dateTime]);

    useEffect(() => {
        fetchTotals();
    }, [fetchTotals]);

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">
                        汇总统计
                    </h2>
                    <p className="text-sm text-slate-400">
                        按所辖下级企业在所选月份汇总全部指标。
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">月份</label>
                    <input
                        type="month"
                        className={cn(inputCls, 'w-40')}
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                    />
                </div>
            </header>

            {loading && (
                <div className="rounded-xl border border-blue-900/40 bg-[#070d1f] p-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl border border-red-500/20 bg-red-600/8 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && totals && (
                <>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <SummaryCard label="汇总月份" value={totals.date} />
                        <SummaryCard
                            label="汇总企业数"
                            value={String(totals.subordinate_count ?? 0)}
                        />
                        <SummaryCard
                            label="已上报企业数"
                            value={String(totals.count_number ?? 0)}
                            highlight
                        />
                    </div>

                    {monthFieldGroups.map((group) => (
                        <section
                            key={group.title}
                            className="rounded-xl border border-blue-900/40 bg-[#070d1f] p-5"
                        >
                            <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                {group.title}
                            </h3>
                            <dl className="grid gap-3 sm:grid-cols-3">
                                {group.fields.map((f) => (
                                    <div
                                        key={f.key as string}
                                        className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3"
                                    >
                                        <dt className="text-xs text-slate-500">
                                            {f.label}
                                        </dt>
                                        <dd className="mt-0.5 text-lg font-semibold text-slate-200">
                                            {(totals[
                                                f.key as keyof MonthTotals
                                            ] as React.ReactNode) ?? 0}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </>
            )}
        </div>
    );
}

function SummaryCard({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border p-4',
                highlight
                    ? 'border-cyan-500/30 bg-cyan-600/10'
                    : 'border-blue-900/40 bg-[#070d1f]',
            )}
        >
            <p className="text-xs text-slate-500">{label}</p>
            <p
                className={cn(
                    'mt-1 text-xl font-semibold',
                    highlight ? 'text-cyan-300' : 'text-slate-200',
                )}
            >
                {value}
            </p>
        </div>
    );
}
