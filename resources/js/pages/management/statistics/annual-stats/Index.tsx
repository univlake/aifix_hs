import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { YearStatisticsPage } from '@/pages/statistics/year-statistics/Index';
import type { ApiResponse } from '@/types/models';

type TabKey = 'list' | 'overview';

export default function AnnualStatsIndex() {
    const [tab, setTab] = useState<TabKey>('list');

    return (
        <>
            <Head title="年度报表统计" />
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
                <YearStatisticsPage pidMode />
            ) : (
                <div className="space-y-4 p-4">
                    <AnnualOverview />
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

interface KidAggRow {
    name: string;
    should_obtain_people: number;
    already_obtain_people: number;
    train_people: number;
}

interface YearTotals {
    safety_funding: number;
    fire_fighting: number;
    count_number: number;
    sl_data: KidAggRow[];
    xf_data: KidAggRow[];
    date: string;
    subordinate_count: number;
}

const inputCls =
    'rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function AnnualOverview() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [year, setYear] = useState<string>(String(new Date().getFullYear()));
    const [totals, setTotals] = useState<YearTotals | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTotals = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get<ApiResponse<YearTotals>>(
                '/year-statistics/statistics',
                {
                    params: { company_id: companyId, date_time: year },
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
    }, [companyId, year]);

    useEffect(() => {
        fetchTotals();
    }, [fetchTotals]);

    const yearOptions = Array.from({ length: 6 }, (_, i) =>
        String(new Date().getFullYear() - i),
    );

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">
                        汇总统计
                    </h2>
                    <p className="text-sm text-slate-400">
                        按所辖下级企业在所选年份汇总费用与持证情况。
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">年度</label>
                    <select
                        className={cn(inputCls, 'w-28')}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
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
                    <div className="grid gap-3 sm:grid-cols-4">
                        <SummaryCard label="汇总年度" value={totals.date} />
                        <SummaryCard
                            label="汇总企业数"
                            value={String(totals.subordinate_count ?? 0)}
                        />
                        <SummaryCard
                            label="已上报企业数"
                            value={String(totals.count_number ?? 0)}
                            highlight
                        />
                        <SummaryCard
                            label="合计安全费用"
                            value={`${totals.safety_funding ?? 0}`}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <StatCard
                            label="合计安全费用"
                            value={totals.safety_funding ?? 0}
                        />
                        <StatCard
                            label="合计消防费用"
                            value={totals.fire_fighting ?? 0}
                        />
                    </div>

                    <KidsSection
                        title="三类人员达标情况（按名称汇总）"
                        items={totals.sl_data}
                    />
                    <KidsSection
                        title="消防持证情况（按名称汇总）"
                        items={totals.xf_data}
                    />
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

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-xl border border-blue-900/40 bg-[#070d1f] p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">
                {value}
            </p>
        </div>
    );
}

function KidsSection({ title, items }: { title: string; items: KidAggRow[] }) {
    return (
        <section className="rounded-xl border border-blue-900/40 bg-[#070d1f] p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {title} ({items?.length ?? 0})
            </h3>
            {!items || items.length === 0 ? (
                <p className="text-sm text-slate-600">—</p>
            ) : (
                <table className="min-w-full text-sm">
                    <thead className="text-left text-xs text-slate-500">
                        <tr>
                            <th className="px-3 py-2">名称</th>
                            <th className="px-3 py-2">应取证</th>
                            <th className="px-3 py-2">已取证</th>
                            <th className="px-3 py-2">培训人数</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {items.map((row) => (
                            <tr key={row.name} className="text-slate-300">
                                <td className="px-3 py-2 text-slate-200">
                                    {row.name}
                                </td>
                                <td className="px-3 py-2">
                                    {row.should_obtain_people ?? 0}
                                </td>
                                <td className="px-3 py-2">
                                    {row.already_obtain_people ?? 0}
                                </td>
                                <td className="px-3 py-2">
                                    {row.train_people ?? 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
