import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Building2,
    TrendingUp,
    RefreshCw,
    ShieldAlert,
    BarChart3,
    ClipboardCheck,
    Star,
    Plus,
    X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────

interface RiskNum {
    inherent_risk: number;
    inherent_risk_grade: string;
}

interface FloatNum {
    float_risk: number;
    float_risk_grade: string;
}

interface GradeStat {
    inherent_risk_grade?: string;
    float_risk_grade?: string;
    num: number;
}

interface DayLog {
    title: string;
    inherent_risk_num: number;
    inherent_risk_grade: string;
    float_risk_num: number;
    float_risk_grade: string;
}

interface SubCompany {
    id: number;
    title: string;
    inherent_risk?: number | string | null;
    inherent_risk_grade?: string | null;
    float_risk?: number | string | null;
    float_risk_grade?: string | null;
}

interface HazardItem {
    company_id: number;
    company_name: string;
    monthly_investigation_scale: number;
    jqr: number;
}

interface FocusItem {
    id: number;
    focus_id: number;
    company_id: number;
    company?: {
        id: number;
        title: string;
        inherent_risk?: number | string | null;
        inherent_risk_grade?: string | null;
        float_risk?: number | string | null;
        float_risk_grade?: string | null;
    } | null;
}

// ── Grade config ───────────────────────────────────────────────────

const GRADE_CONFIG: Record<
    string,
    { bg: string; text: string; border: string; dot: string; bar: string }
> = {
    红: {
        bg: 'bg-red-600/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        bar: '#ef4444',
    },
    橙: {
        bg: 'bg-orange-600/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400',
        bar: '#f97316',
    },
    黄: {
        bg: 'bg-yellow-600/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-400',
        bar: '#eab308',
    },
    蓝: {
        bg: 'bg-blue-600/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-400',
        bar: '#3b82f6',
    },
};

function GradeBadge({ grade }: { grade?: string }) {
    if (!grade) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                未评级
            </span>
        );
    }

    const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG['蓝'];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                cfg.bg,
                cfg.text,
                cfg.border,
            )}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {grade}色
        </span>
    );
}

function ScoreBar({ score, max = 25 }: { score?: number; max?: number }) {
    const val = score ?? 0;
    const pct = Math.min((val / max) * 100, 100);
    const cfg =
        GRADE_CONFIG[val < 5 ? '红' : val < 10 ? '橙' : val < 15 ? '黄' : '蓝'];

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: cfg?.bar ?? '#3b82f6',
                    }}
                />
            </div>
            <span className="w-10 text-right font-mono text-xs text-slate-400">
                {val || '—'}
            </span>
        </div>
    );
}

function formatDay(dateStr: string): string {
    // dateStr is like "20260415"
    if (dateStr.length === 8) {
        return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
    }

    return dateStr;
}

// ── Page ──────────────────────────────────────────────────────────

export default function RiskMonitor() {
    const { rootCompany } = useScope();

    const [inherentNum, setInherentNum] = useState<RiskNum | null>(null);
    const [floatNum, setFloatNum] = useState<FloatNum | null>(null);
    const [inherentStats, setInherentStats] = useState<GradeStat[]>([]);
    const [floatStats, setFloatStats] = useState<GradeStat[]>([]);
    const [riskLog, setRiskLog] = useState<DayLog[]>([]);
    const [subCompanies, setSubCompanies] = useState<SubCompany[]>([]);
    const [hazardSort, setHazardSort] = useState<HazardItem[]>([]);
    const [focusList, setFocusList] = useState<FocusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rankTab, setRankTab] = useState<
        'inherent' | 'float' | 'hazard' | 'focus'
    >('inherent');

    const fetchAll = useCallback(() => {
        if (!rootCompany?.id) {
            return;
        }

        setLoading(true);
        setError('');

        const cid = rootCompany.id;
        const params = { company_id: cid };

        Promise.all([
            api.get('/bloc-risks-inherent', { params }),
            api.get('/bloc-risks-float', { params }),
            api.get('/bloc-risks-inherent-statistics', { params }),
            api.get('/bloc-risks-float-statistics', { params }),
            api.get('/bloc-risks-log', { params }),
            // Fetch sub-companies directly for rankings — always has current risk values
            api.get('/companies', { params: { pid: cid, per_page: 200 } }),
            api.get('/bloc-hidden-danger-sort', { params }),
            api.get('/focus-companies', {
                params: { company_id: cid, per_page: 100 },
            }),
        ])
            .then(([iNum, fNum, iStats, fStats, log, subs, hSort, focus]) => {
                setInherentNum(iNum.data.data);
                setFloatNum(fNum.data.data);
                setInherentStats(iStats.data.data ?? []);
                setFloatStats(fStats.data.data ?? []);
                setRiskLog(log.data.data ?? []);
                setSubCompanies(subs.data.data?.data ?? []);
                setHazardSort(hSort.data.data ?? []);
                setFocusList(focus.data.data?.data ?? []);
            })
            .catch(() => setError('加载风险数据失败'))
            .finally(() => setLoading(false));
    }, [rootCompany?.id]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const refreshFocus = useCallback(async () => {
        if (!rootCompany?.id) {
            return;
        }

        const res = await api.get('/focus-companies', {
            params: { company_id: rootCompany.id, per_page: 100 },
        });
        setFocusList(res.data.data?.data ?? []);
    }, [rootCompany?.id]);

    // Build sorted rankings from live company data (always current, not today-only like RiskLog)
    // 集团本身不参与下属企业排名对比。
    const rootId = rootCompany?.id;
    const inherentSort = subCompanies
        .filter((c) => c.id !== rootId && c.inherent_risk != null)
        .sort((a, b) => Number(b.inherent_risk) - Number(a.inherent_risk));
    const floatSort = subCompanies
        .filter((c) => c.id !== rootId && c.float_risk != null)
        .sort((a, b) => Number(b.float_risk) - Number(a.float_risk));

    const activeSort =
        rankTab === 'inherent'
            ? inherentSort
            : rankTab === 'float'
              ? floatSort
              : [];
    const totalInherent = inherentStats.reduce((s, r) => s + r.num, 0);
    const totalFloat = floatStats.reduce((s, r) => s + r.num, 0);

    return (
        <>
            <Head title="风险监测" />

            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        风险监测
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        集团企业风险等级动态监控与历史趋势分析
                    </p>
                </div>
                <button
                    onClick={fetchAll}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-50"
                >
                    <RefreshCw
                        className={cn('h-3.5 w-3.5', loading && 'animate-spin')}
                    />
                    刷新
                </button>
            </div>

            {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Group risk overview cards */}
            {loading ? (
                <div className="mb-6 grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="h-36 rounded-xl border border-blue-900/40 bg-[#0d1530]"
                        />
                    ))}
                </div>
            ) : (
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RiskOverviewCard
                        icon={ShieldAlert}
                        iconClass="border-red-600/20 bg-red-600/10 text-red-400"
                        title="集团固有风险指数"
                        score={inherentNum?.inherent_risk}
                        grade={inherentNum?.inherent_risk_grade}
                        stats={inherentStats}
                        total={totalInherent}
                        gradeKey="inherent_risk_grade"
                    />
                    <RiskOverviewCard
                        icon={Activity}
                        iconClass="border-orange-600/20 bg-orange-600/10 text-orange-400"
                        title="集团浮动风险指数"
                        score={floatNum?.float_risk}
                        grade={floatNum?.float_risk_grade}
                        stats={floatStats}
                        total={totalFloat}
                        gradeKey="float_risk_grade"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                {/* 7-day trend (left 3/5) */}
                <div className="lg:col-span-3">
                    <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#0d1530]">
                        <div className="flex items-center gap-2 border-b border-blue-900/40 px-5 py-3.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-blue-600/20 bg-blue-600/10">
                                <TrendingUp className="h-3 w-3 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-200">
                                近7日风险趋势
                            </h3>
                        </div>

                        {loading ? (
                            <div className="animate-pulse space-y-px p-2">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-12 rounded bg-slate-800/30"
                                    />
                                ))}
                            </div>
                        ) : riskLog.length === 0 ? (
                            <div className="px-5 py-14 text-center">
                                <BarChart3 className="mx-auto mb-2 h-8 w-8 text-slate-800" />
                                <p className="text-sm text-slate-600">
                                    暂无历史风险数据
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-blue-900/20">
                                            <th className="px-5 py-2.5 text-left text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                                日期
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                                固有风险
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                                浮动风险
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riskLog.map((day, i) => (
                                            <tr
                                                key={i}
                                                className={cn(
                                                    'border-b border-blue-900/10 transition-colors hover:bg-blue-600/5',
                                                    i === riskLog.length - 1 &&
                                                        'border-b-0',
                                                )}
                                            >
                                                <td className="px-5 py-3 font-mono text-slate-400">
                                                    {formatDay(day.title)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <GradeBadge
                                                            grade={
                                                                day.inherent_risk_grade
                                                            }
                                                        />
                                                        <span className="font-mono text-slate-400">
                                                            {
                                                                day.inherent_risk_num
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <GradeBadge
                                                            grade={
                                                                day.float_risk_grade
                                                            }
                                                        />
                                                        <span className="font-mono text-slate-400">
                                                            {day.float_risk_num}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ranking panels (right 2/5) */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#0d1530]">
                        {/* Tabs */}
                        <div className="border-b border-blue-900/40 px-3 py-2">
                            <div className="flex rounded-lg border border-blue-900/30 bg-[#070d1f] p-0.5">
                                {(
                                    [
                                        { key: 'inherent', label: '固有排名' },
                                        { key: 'float', label: '浮动排名' },
                                        { key: 'hazard', label: '隐患排名' },
                                        { key: 'focus', label: '重点关注' },
                                    ] as const
                                ).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setRankTab(key)}
                                        className={cn(
                                            'flex-1 rounded-md py-1.5 text-[11px] font-medium transition-all',
                                            rankTab === key
                                                ? 'bg-blue-600/25 text-blue-300'
                                                : 'text-slate-500 hover:text-slate-300',
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="max-h-[460px] overflow-y-auto">
                            {loading ? (
                                <div className="animate-pulse space-y-px p-2">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 rounded bg-slate-800/30"
                                        />
                                    ))}
                                </div>
                            ) : rankTab === 'hazard' ? (
                                <HazardRankList items={hazardSort} />
                            ) : rankTab === 'focus' ? (
                                <FocusList
                                    items={focusList}
                                    subCompanies={subCompanies}
                                    rootCompanyId={rootCompany?.id ?? 0}
                                    onChange={refreshFocus}
                                />
                            ) : activeSort.length === 0 ? (
                                <div className="px-5 py-14 text-center">
                                    <Building2 className="mx-auto mb-2 h-8 w-8 text-slate-800" />
                                    <p className="text-sm text-slate-600">
                                        暂无风险排名数据
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-blue-900/20">
                                    {activeSort.map((item, i) => {
                                        const score =
                                            rankTab === 'inherent'
                                                ? item.inherent_risk
                                                : item.float_risk;
                                        const grade =
                                            rankTab === 'inherent'
                                                ? item.inherent_risk_grade
                                                : item.float_risk_grade;

                                        return (
                                            <div
                                                key={item.id}
                                                className="px-4 py-3 transition-colors hover:bg-blue-600/5"
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold',
                                                                i === 0
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : i === 1
                                                                      ? 'bg-orange-500/20 text-orange-400'
                                                                      : i === 2
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-slate-700 text-slate-500',
                                                            )}
                                                        >
                                                            {i + 1}
                                                        </span>
                                                        <p className="truncate text-xs text-slate-300">
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                    <GradeBadge
                                                        grade={
                                                            grade ?? undefined
                                                        }
                                                    />
                                                </div>
                                                <div className="ml-7">
                                                    <ScoreBar
                                                        score={
                                                            score != null
                                                                ? Number(score)
                                                                : undefined
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────

function RiskOverviewCard({
    icon: Icon,
    iconClass,
    title,
    score,
    grade,
    stats,
    total,
    gradeKey,
}: {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    title: string;
    score?: number;
    grade?: string;
    stats: GradeStat[];
    total: number;
    gradeKey: 'inherent_risk_grade' | 'float_risk_grade';
}) {
    const GRADE_ORDER = ['红', '橙', '黄', '蓝'];

    return (
        <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border',
                            iconClass,
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">
                        {title}
                    </h3>
                </div>
                <GradeBadge grade={grade} />
            </div>
            <ScoreBar score={score} />
            <p className="mt-1.5 text-xs text-slate-600">
                综合指数：{score ?? '暂无数据'}
            </p>

            {total > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {GRADE_ORDER.map((g) => {
                        const stat = stats.find(
                            (s) =>
                                (s[gradeKey] ??
                                    s.inherent_risk_grade ??
                                    s.float_risk_grade) === g,
                        );

                        if (!stat) {
                            return null;
                        }

                        const cfg = GRADE_CONFIG[g];

                        return (
                            <span
                                key={g}
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px]',
                                    cfg.bg,
                                    cfg.border,
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        cfg.dot,
                                    )}
                                />
                                <span className={cfg.text}>{g}色</span>
                                <span className="text-slate-500">
                                    {stat.num}家
                                </span>
                            </span>
                        );
                    })}
                    <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/40 px-2 py-0.5 text-[10px] text-slate-500">
                        共{total}家
                    </span>
                </div>
            )}
        </div>
    );
}

function HazardRankList({ items }: { items: HazardItem[] }) {
    if (items.length === 0) {
        return (
            <div className="px-5 py-14 text-center">
                <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-slate-800" />
                <p className="text-sm text-slate-600">暂无隐患整改数据</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-blue-900/20">
            {items.map((item, i) => {
                const pct = item.monthly_investigation_scale;
                const trend = item.jqr;

                return (
                    <div
                        key={item.company_id}
                        className="px-4 py-3 transition-colors hover:bg-blue-600/5"
                    >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className={cn(
                                        'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold',
                                        i === 0
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-700 text-slate-500',
                                    )}
                                >
                                    {i + 1}
                                </span>
                                <p className="truncate text-xs text-slate-300">
                                    {item.company_name}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 text-[10px]">
                                <span
                                    className={cn(
                                        pct >= 80
                                            ? 'text-emerald-400'
                                            : pct >= 50
                                              ? 'text-yellow-400'
                                              : 'text-red-400',
                                    )}
                                >
                                    {pct}%
                                </span>
                                {trend !== 0 && (
                                    <span
                                        className={cn(
                                            'text-[9px]',
                                            trend > 0
                                                ? 'text-emerald-400'
                                                : 'text-red-400',
                                        )}
                                    >
                                        {trend > 0 ? '+' : ''}
                                        {trend}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor:
                                        pct >= 80
                                            ? '#10b981'
                                            : pct >= 50
                                              ? '#eab308'
                                              : '#ef4444',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function FocusList({
    items,
    subCompanies,
    rootCompanyId,
    onChange,
}: {
    items: FocusItem[];
    subCompanies: SubCompany[];
    rootCompanyId: number;
    onChange: () => void | Promise<void>;
}) {
    const { canWrite } = usePermission();
    const canCreate = canWrite('focus-companies.create');
    const canDelete = canWrite('focus-companies.delete');
    const [showPicker, setShowPicker] = useState(false);
    const [query, setQuery] = useState('');
    const [addingId, setAddingId] = useState<number | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const focusedIds = new Set(items.map((i) => i.focus_id));
    const q = query.trim().toLowerCase();
    const candidates = subCompanies
        .filter((c) => !focusedIds.has(c.id))
        .filter((c) => !q || c.title.toLowerCase().includes(q));

    const add = async (focusId: number) => {
        if (!rootCompanyId) {
            return;
        }

        setAddingId(focusId);

        try {
            await api.post('/focus-companies', {
                company_id: rootCompanyId,
                focus_id: focusId,
            });
            await onChange();
        } finally {
            setAddingId(null);
        }
    };

    const remove = async (id: number) => {
        setRemovingId(id);

        try {
            await api.delete(`/focus-companies/${id}`);
            await onChange();
        } finally {
            setRemovingId(null);
            setConfirmId(null);
        }
    };

    return (
        <>
            {canCreate && (
                <div className="border-b border-blue-900/20 p-2">
                    {!showPicker ? (
                        <button
                            onClick={() => setShowPicker(true)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-[11px] text-slate-400 hover:border-blue-500/40 hover:text-blue-300"
                        >
                            <Plus className="h-3 w-3" />
                            添加关注企业
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="search"
                                    placeholder="搜索企业..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                    className="flex-1 rounded-md border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        setShowPicker(false);
                                        setQuery('');
                                    }}
                                    className="text-[11px] text-slate-500 hover:text-slate-300"
                                >
                                    收起
                                </button>
                            </div>
                            <div className="max-h-44 space-y-1 overflow-y-auto">
                                {candidates.length === 0 ? (
                                    <p className="py-2 text-center text-[11px] text-slate-600">
                                        {q
                                            ? '未找到匹配企业'
                                            : '所有下级企业已关注'}
                                    </p>
                                ) : (
                                    candidates.slice(0, 50).map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => add(c.id)}
                                            disabled={addingId != null}
                                            className="flex w-full items-center justify-between gap-2 rounded-md border border-blue-900/30 bg-[#070d1f] px-2.5 py-1.5 text-left text-xs text-slate-300 hover:border-blue-500/40 hover:bg-[#0a1329] disabled:opacity-50"
                                        >
                                            <span className="truncate">
                                                {c.title}
                                            </span>
                                            <span className="shrink-0 text-blue-400">
                                                {addingId === c.id
                                                    ? '添加中…'
                                                    : '+ 关注'}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {items.length === 0 ? (
                <div className="px-5 py-10 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-slate-800" />
                    <p className="text-sm text-slate-600">暂无重点关注企业</p>
                </div>
            ) : (
                <div className="divide-y divide-blue-900/20">
                    {items.map((item) => {
                        const c = item.company;

                        return (
                            <div
                                key={item.id}
                                className="px-4 py-3 transition-colors hover:bg-blue-600/5"
                            >
                                <div className="mb-2 flex min-w-0 items-center gap-2">
                                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                                    <p className="flex-1 truncate text-xs text-slate-300">
                                        {c?.title ?? `企业#${item.focus_id}`}
                                    </p>
                                    {canDelete &&
                                        (confirmId === item.id ? (
                                            <div className="flex shrink-0 items-center gap-1 text-[10px]">
                                                <button
                                                    onClick={() =>
                                                        remove(item.id)
                                                    }
                                                    disabled={
                                                        removingId === item.id
                                                    }
                                                    className="rounded border border-red-500/30 bg-red-600/15 px-1.5 py-0.5 text-red-300 hover:bg-red-600/25 disabled:opacity-50"
                                                >
                                                    {removingId === item.id
                                                        ? '取消中…'
                                                        : '确认取消'}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setConfirmId(null)
                                                    }
                                                    disabled={
                                                        removingId === item.id
                                                    }
                                                    className="rounded px-1.5 py-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-50"
                                                >
                                                    返回
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setConfirmId(item.id)
                                                }
                                                className="shrink-0 rounded text-slate-600 hover:text-red-400"
                                                title="取消关注"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        ))}
                                </div>
                                <div className="ml-5 grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                        <p className="mb-0.5 text-[9px] tracking-wider text-slate-600 uppercase">
                                            固有
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <GradeBadge
                                                grade={
                                                    c?.inherent_risk_grade ??
                                                    undefined
                                                }
                                            />
                                            <span className="font-mono text-slate-400">
                                                {c?.inherent_risk != null
                                                    ? Number(c.inherent_risk)
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 text-[9px] tracking-wider text-slate-600 uppercase">
                                            浮动
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <GradeBadge
                                                grade={
                                                    c?.float_risk_grade ??
                                                    undefined
                                                }
                                            />
                                            <span className="font-mono text-slate-400">
                                                {c?.float_risk != null
                                                    ? Number(c.float_risk)
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
