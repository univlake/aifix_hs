import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    RefreshCw,
    ShieldAlert,
    TrendingUp,
    Radar,
    Clock,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────

interface InherentLog {
    safety_architecture_value?: number;
    production_standardization_scale?: number;
    health_system_scale?: number;
    assess_detect_scale?: number;
    funding_execution_scale?: number;
    security_officer_scale?: number;
    already_obtain_people_scale?: number;
    high_school_diploma_scale?: number;
    staff_scale?: number;
    safety_engineering_major_scale?: number;
    last_year_income_scale?: number;
    acreage_scale?: number;
    hazardous_processes_scale?: number;
    hazardous_process_scale?: number;
    hazardous_process_more_scale?: number;
    process_is_automatic_scale?: number;
    special_equipment_number_scale?: number;
    equipment_more_number_scale?: number;
    hazardous_chemical_scale?: number;
    hazardous_chemicals_number_scale?: number;
    major_hazard_scale?: number;
}

interface FloatLog {
    internal_meeting_scale?: number;
    internal_training_scale?: number;
    emergency_team_scale?: number;
    emergency_drill_scale?: number;
    accident_bulletin_scale?: number;
    accident_bulletin_severe_scale?: number;
    risk_source_scale?: number;
    monthly_investigation_scale?: number;
    three_together_over_scale?: number;
    job_management_scale?: number;
    health_checkup_scale?: number;
    health_checkup_people_scale?: number;
    health_report_scale?: number;
}

interface CompanyRisk {
    inherent_risk?: number | null;
    inherent_risk_grade?: string | null;
    float_risk?: number | null;
    float_risk_grade?: string | null;
}

interface PortraitData {
    inherent_risk_log?: InherentLog & {
        id: number;
        company_id: number;
        created_at: string;
    };
    float_risk_log?: FloatLog & {
        id: number;
        company_id: number;
        created_at: string;
    };
    risk_log?: {
        id: number;
        risk_num?: number;
        risk_grade?: string;
        old_risk_num?: number;
        old_risk_grade?: string;
        date?: string;
    };
}

interface TimelineEntry {
    id: number;
    // `date` is stored as a YYYYMMDD integer column; `created_at` is an ISO string.
    date?: string | number;
    risk_num?: number;
    old_risk_num?: number;
    risk_grade?: string;
    type?: string;
    created_at?: string;
}

// Normalize either source (`date` int or `created_at` ISO) to a YYYY-MM-DD prefix.
function entryDateString(e: TimelineEntry): string {
    const d = e.date ?? e.created_at ?? '';
    if (!d) {
        return '';
    }
    const s = String(d);
    if (/^\d{8}$/.test(s)) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    }

    return s.slice(0, 10);
}

// ── Grade config ───────────────────────────────────────────────────

const GRADE_CONFIG: Record<
    string,
    {
        bg: string;
        text: string;
        border: string;
        dot: string;
        bar: string;
        hex: string;
    }
> = {
    红: {
        bg: 'bg-red-600/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        bar: '#ef4444',
        hex: '#ef4444',
    },
    橙: {
        bg: 'bg-orange-600/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400',
        bar: '#f97316',
        hex: '#f97316',
    },
    黄: {
        bg: 'bg-yellow-600/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-400',
        bar: '#eab308',
        hex: '#eab308',
    },
    蓝: {
        bg: 'bg-blue-600/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-400',
        bar: '#3b82f6',
        hex: '#3b82f6',
    },
};

function gradeConfig(grade?: string) {
    if (!grade) {
        return null;
    }

    return GRADE_CONFIG[grade] ?? null;
}

function GradeBadge({ grade }: { grade?: string }) {
    if (!grade) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                未评级
            </span>
        );
    }

    const cfg = gradeConfig(grade);

    if (!cfg) {
        return <span className="text-xs text-slate-400">{grade}</span>;
    }

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
            {grade}色风险
        </span>
    );
}

// ── Dimension computation ──────────────────────────────────────────

// Each dimension is the sum of a subset of *_scale fields stored on
// inherent/float risk logs. Fields are raw weighted scores from the trait —
// per-field max equals its weight constant (mostly 0.001–0.16). To make
// dimensions comparable on a single radar, we score each as a % of its own
// "full marks" — the sum of the weight constants for the fields it contains.
// (Source-of-truth weights live in App\Traits\CalculateRiskValue::*_WEIGHTS.)
type Dim = { label: string; source: 'i' | 'f'; fields: [string, number][] };

const DIMENSIONS: Dim[] = [
    {
        label: '基础管理',
        source: 'i',
        fields: [
            ['safety_architecture_value', 0.02496],
            ['production_standardization_scale', 0.002665],
            ['health_system_scale', 0.002665],
            ['assess_detect_scale', 0.00533],
            ['funding_execution_scale', 0.007345],
        ],
    },
    {
        label: '人员构成',
        source: 'i',
        fields: [
            ['security_officer_scale', 0.007345],
            ['already_obtain_people_scale', 0.007345],
            ['high_school_diploma_scale', 0.014235],
            ['staff_scale', 0.007865],
            ['safety_engineering_major_scale', 0.035035],
            ['last_year_income_scale', 0.007345],
            ['acreage_scale', 0.007865],
        ],
    },
    {
        label: '工艺风险',
        source: 'i',
        fields: [
            ['hazardous_processes_scale', 0.14775],
            ['hazardous_process_scale', 0.04925],
            ['hazardous_process_more_scale', 0.14775],
            ['process_is_automatic_scale', 0.04925],
        ],
    },
    {
        label: '设备风险',
        source: 'i',
        fields: [
            ['special_equipment_number_scale', 0.119],
            ['equipment_more_number_scale', 0.119],
        ],
    },
    {
        label: '物料风险',
        source: 'i',
        fields: [
            ['hazardous_chemical_scale', 0.158746],
            ['hazardous_chemicals_number_scale', 0.0594405],
            ['major_hazard_scale', 0.0198135],
        ],
    },
    {
        label: '会议培训',
        source: 'f',
        fields: [
            ['internal_meeting_scale', 0.031635],
            ['internal_training_scale', 0.063365],
        ],
    },
    {
        label: '应急管理',
        source: 'f',
        fields: [
            ['emergency_team_scale', 0.0441225],
            ['emergency_drill_scale', 0.0441225],
            ['accident_bulletin_scale', 0.10075035],
            ['accident_bulletin_severe_scale', 0.058859415],
        ],
    },
    {
        label: '风险管理',
        source: 'f',
        fields: [
            ['monthly_investigation_scale', 0.083752],
            ['three_together_over_scale', 0.048488],
            ['job_management_scale', 0.228114],
        ],
    },
    {
        label: '职业健康',
        source: 'f',
        fields: [
            ['health_checkup_scale', 0.022962],
            ['health_checkup_people_scale', 0.009345],
            ['health_report_scale', 0.056693],
        ],
    },
];

function computeDimensions(
    inherent?: InherentLog,
    float_?: FloatLog,
): number[] {
    const i = (inherent ?? {}) as Record<string, unknown>;
    const f = (float_ ?? {}) as Record<string, unknown>;

    return DIMENSIONS.map((d) => {
        const log = d.source === 'i' ? i : f;
        let raw = 0;
        let max = 0;
        for (const [key, weight] of d.fields) {
            raw += Number(log[key]) || 0;
            max += weight;
        }

        return max > 0 ? (raw / max) * 100 : 0;
    });
}

const RADAR_LABELS = DIMENSIONS.map((d) => d.label);
const FALLBACK_VALUES = [28, 65, 0, 0, 16, 0, 59, 0, 57];
const RADAR_MAX = 100;

// ── Radar Chart ────────────────────────────────────────────────────

function RadarChart({ values }: { values: number[] }) {
    const n = RADAR_LABELS.length;
    const cx = 210;
    const cy = 195;
    const r = 140;

    const angles = Array.from(
        { length: n },
        (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / n,
    );

    const axis = (angle: number, scale: number) => ({
        x: cx + scale * r * Math.cos(angle),
        y: cy + scale * r * Math.sin(angle),
    });

    const gridLevels = [0.25, 0.5, 0.75, 1];

    const dataPoints = values.map((v, i) =>
        axis(angles[i], Math.min(v / RADAR_MAX, 1)),
    );
    const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

    const labelOffset = (angle: number) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const labelR = r + 28;

        return {
            x: cx + labelR * cos,
            y:
                cy +
                labelR * sin +
                (Math.abs(sin) > 0.7 ? (sin > 0 ? 12 : -4) : 4),
        };
    };

    return (
        <svg
            viewBox="0 0 420 390"
            className="mx-auto w-full max-w-md select-none"
        >
            <defs>
                <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop
                        offset="100%"
                        stopColor="#1d4ed8"
                        stopOpacity="0.15"
                    />
                </radialGradient>
            </defs>

            {/* Grid lines */}
            {gridLevels.map((scale, gi) => {
                const pts = angles.map((a) => axis(a, scale));
                const polygon = pts.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                    <polygon
                        key={gi}
                        points={polygon}
                        fill="none"
                        stroke="#1e3a5f"
                        strokeWidth="1"
                    />
                );
            })}

            {/* Axis lines */}
            {angles.map((angle, i) => {
                const end = axis(angle, 1);

                return (
                    <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={end.x}
                        y2={end.y}
                        stroke="#1e3a5f"
                        strokeWidth="1"
                    />
                );
            })}

            {/* Data polygon */}
            <polygon
                points={dataPolygon}
                fill="url(#radarFill)"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#3b82f6"
                    stroke="#0d1530"
                    strokeWidth="1.5"
                />
            ))}

            {/* Center dot */}
            <circle cx={cx} cy={cy} r="3" fill="#1e3a5f" />

            {/* Labels */}
            {RADAR_LABELS.map((label, i) => {
                const pos = labelOffset(angles[i]);
                const val = values[i];

                return (
                    <g key={i}>
                        <text
                            x={pos.x}
                            y={pos.y - 8}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#94a3b8"
                            fontFamily="system-ui, sans-serif"
                        >
                            {label}
                        </text>
                        <text
                            x={pos.x}
                            y={pos.y + 6}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#3b82f6"
                            fontFamily="monospace"
                        >
                            {val.toFixed(2)}
                        </text>
                    </g>
                );
            })}

            {/* Grid scale labels */}
            {gridLevels.map((scale, gi) => (
                <text
                    key={gi}
                    x={cx + 4}
                    y={cy - scale * r + 3}
                    fontSize="8"
                    fill="#374151"
                    fontFamily="monospace"
                >
                    {(scale * RADAR_MAX).toFixed(0)}
                </text>
            ))}
        </svg>
    );
}

// ── Line Chart ─────────────────────────────────────────────────────

function LineChart({ data }: { data: TimelineEntry[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-sm text-slate-600">
                <TrendingUp className="mr-2 h-5 w-5" />
                暂无历史风险数据
            </div>
        );
    }

    const sorted = [...data].sort((a, b) =>
        entryDateString(a).localeCompare(entryDateString(b)),
    );

    const values = sorted.map((e) => Number(e.risk_num) || 0);
    const maxVal = Math.max(...values, 1);

    const W = 600;
    const H = 200;
    const padL = 36;
    const padR = 16;
    const padT = 12;
    const padB = 28;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const n = sorted.length;
    const xScale = n > 1 ? chartW / (n - 1) : chartW;
    const yScale = chartH / maxVal;

    const pts = sorted.map((e, i) => ({
        x: padL + i * xScale,
        y: padT + chartH - (Number(e.risk_num) || 0) * yScale,
    }));

    const linePath = pts
        .map(
            (p, i) =>
                `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
        )
        .join(' ');
    const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        val: (t * maxVal).toFixed(1),
        y: padT + chartH - t * chartH,
    }));

    const formatDate = (entry: TimelineEntry) =>
        entryDateString(entry).slice(5); // MM-DD

    const tickStep = Math.max(1, Math.floor(n / 6));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
                <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid */}
            {yTicks.map((tick) => (
                <g key={tick.val}>
                    <line
                        x1={padL}
                        y1={tick.y}
                        x2={W - padR}
                        y2={tick.y}
                        stroke="#1e3a5f"
                        strokeWidth="0.5"
                        strokeDasharray="4 4"
                    />
                    <text
                        x={padL - 4}
                        y={tick.y + 3}
                        textAnchor="end"
                        fontSize="8"
                        fill="#475569"
                        fontFamily="monospace"
                    >
                        {tick.val}
                    </text>
                </g>
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#lineArea)" />

            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Points */}
            {pts.map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="#3b82f6"
                    stroke="#0d1530"
                    strokeWidth="1.5"
                />
            ))}

            {/* X labels */}
            {sorted.map((entry, i) => {
                if (i % tickStep !== 0 && i !== n - 1) {
                    return null;
                }

                return (
                    <text
                        key={i}
                        x={padL + i * xScale}
                        y={H - 6}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#475569"
                        fontFamily="monospace"
                    >
                        {formatDate(entry)}
                    </text>
                );
            })}

            {/* Grade dots overlay */}
            {sorted.map((entry, i) => {
                const grade = entry.risk_grade;

                if (!grade) {
                    return null;
                }

                const cfg = GRADE_CONFIG[grade];

                if (!cfg) {
                    return null;
                }

                return (
                    <circle
                        key={`g${i}`}
                        cx={pts[i].x}
                        cy={pts[i].y}
                        r="4.5"
                        fill={cfg.hex}
                        stroke="#0d1530"
                        strokeWidth="1"
                        opacity="0.8"
                    />
                );
            })}
        </svg>
    );
}

// ── Page ──────────────────────────────────────────────────────────

type Tab = 'warning' | 'portrait' | 'timeline';

export default function RiskWarningIndex() {
    const { activeCompany } = useScope();
    const [tab, setTab] = useState<Tab>('warning');
    const [companyRisk, setCompanyRisk] = useState<CompanyRisk | null>(null);
    const [portrait, setPortrait] = useState<PortraitData | null>(null);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAll = useCallback(() => {
        if (!activeCompany?.id) {
            return;
        }

        setLoading(true);
        setError('');
        const cid = activeCompany.id;

        Promise.all([
            api.get(`/companies/${cid}`),
            api.get('/risks/portrait', { params: { company_id: cid } }),
            api.get('/risks/log', {
                params: { company_id: cid, per_page: 30 },
            }),
        ])
            .then(([companyRes, portraitRes, logRes]) => {
                setCompanyRisk(companyRes.data.data ?? null);
                const pd = portraitRes.data.data;
                setPortrait(Array.isArray(pd) && pd.length === 0 ? null : pd);
                const logData =
                    logRes.data.data?.data ?? logRes.data.data ?? [];
                setTimeline(Array.isArray(logData) ? logData : []);
            })
            .catch(() => setError('加载风险数据失败'))
            .finally(() => setLoading(false));
    }, [activeCompany?.id]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const radarValues = portrait
        ? computeDimensions(portrait.inherent_risk_log, portrait.float_risk_log)
        : FALLBACK_VALUES;

    const TABS: {
        key: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[] = [
        { key: 'warning', label: '风险预警', icon: ShieldAlert },
        { key: 'portrait', label: '企业画像', icon: Radar },
        { key: 'timeline', label: '风险时间轴', icon: Clock },
    ];

    return (
        <>
            <Head title="风险监测预警" />

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        风险监测预警
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        企业固有风险与浮动风险实时监测与历史趋势分析
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
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="mb-5 flex rounded-xl border border-blue-900/40 bg-[#0a1428] p-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
                            tab === key
                                ? 'bg-blue-600/20 text-blue-300 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Risk Early Warning ─────────────────────────────── */}
            {tab === 'warning' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2">
                            {[0, 1].map((i) => (
                                <div
                                    key={i}
                                    className="h-44 rounded-xl border border-blue-900/40 bg-[#0d1530]"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <RiskIndexCard
                                icon={ShieldAlert}
                                iconClass="border-red-600/20 bg-red-600/10 text-red-400"
                                title="固有风险指数"
                                subtitle="企业固有属性决定的本底风险"
                                value={
                                    companyRisk?.inherent_risk != null
                                        ? Number(companyRisk.inherent_risk)
                                        : undefined
                                }
                                grade={
                                    companyRisk?.inherent_risk_grade ??
                                    undefined
                                }
                                accent="red"
                            />
                            <RiskIndexCard
                                icon={Activity}
                                iconClass="border-orange-600/20 bg-orange-600/10 text-orange-400"
                                title="浮动风险指数"
                                subtitle="动态管理活动影响的叠加风险"
                                value={
                                    companyRisk?.float_risk != null
                                        ? Number(companyRisk.float_risk)
                                        : undefined
                                }
                                grade={
                                    companyRisk?.float_risk_grade ?? undefined
                                }
                                accent="orange"
                            />
                        </div>
                    )}

                    {/* Dimension breakdown */}
                    {!loading && (
                        <div className="rounded-xl border border-blue-900/40 bg-[#0d1530]">
                            <div className="border-b border-blue-900/40 px-5 py-3.5">
                                <h3 className="text-sm font-semibold text-slate-200">
                                    各维度风险分项
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-px divide-y divide-blue-900/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-blue-900/20">
                                {RADAR_LABELS.map((label, i) => {
                                    const val = radarValues[i];
                                    const pct = Math.min(
                                        (val / RADAR_MAX) * 100,
                                        100,
                                    );

                                    return (
                                        <div key={label} className="px-4 py-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">
                                                    {label}
                                                </span>
                                                <span className="font-mono text-xs text-slate-300">
                                                    {val.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Enterprise Portrait ────────────────────────────── */}
            {tab === 'portrait' && (
                <div className="rounded-xl border border-blue-900/40 bg-[#0d1530]">
                    <div className="border-b border-blue-900/40 px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-slate-200">
                            企业安全风险画像
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                            基于固有风险与浮动风险各维度分项综合绘制
                        </p>
                    </div>
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <div className="h-52 w-52 animate-pulse rounded-full bg-slate-800/40" />
                        </div>
                    ) : (
                        <div className="p-6">
                            <RadarChart values={radarValues} />
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                {RADAR_LABELS.map((label, i) => (
                                    <span
                                        key={label}
                                        className="flex items-center gap-1.5 text-[11px] text-slate-500"
                                    >
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500/60" />
                                        {label}
                                        <span className="font-mono text-blue-400">
                                            {radarValues[i].toFixed(2)}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Enterprise Risk Timeline ───────────────────────── */}
            {tab === 'timeline' && (
                <div className="rounded-xl border border-blue-900/40 bg-[#0d1530]">
                    <div className="border-b border-blue-900/40 px-5 py-3.5">
                        <h3 className="text-sm font-semibold text-slate-200">
                            企业风险时间轴
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                            综合风险指数随时间的变化趋势（近 30 条记录）
                        </p>
                    </div>
                    {loading ? (
                        <div className="h-56 animate-pulse p-5">
                            <div className="h-full rounded-lg bg-slate-800/30" />
                        </div>
                    ) : (
                        <div className="p-5">
                            <LineChart data={timeline} />

                            {/* Grade legend */}
                            <div className="mt-4 flex flex-wrap gap-3">
                                {Object.entries(GRADE_CONFIG).map(
                                    ([grade, cfg]) => (
                                        <span
                                            key={grade}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
                                                cfg.bg,
                                                cfg.text,
                                                cfg.border,
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'h-1.5 w-1.5 rounded-full',
                                                    cfg.dot,
                                                )}
                                            />
                                            {grade}色
                                        </span>
                                    ),
                                )}
                            </div>

                            {/* Timeline list */}
                            {timeline.length > 0 && (
                                <div className="mt-5 space-y-px">
                                    <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                        变更记录
                                    </p>
                                    <div className="max-h-64 overflow-y-auto rounded-lg border border-blue-900/30">
                                        {[...timeline]
                                            .reverse()
                                            .map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-center gap-3 border-b border-blue-900/20 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-blue-600/5"
                                                >
                                                    <span className="w-24 shrink-0 font-mono text-[11px] text-slate-500">
                                                        {entryDateString(entry)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <GradeBadge
                                                            grade={
                                                                entry.risk_grade
                                                            }
                                                        />
                                                    </div>
                                                    <span className="ml-auto font-mono text-xs text-slate-400">
                                                        {entry.risk_num != null
                                                            ? entry.risk_num
                                                            : '—'}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────

function RiskIndexCard({
    icon: Icon,
    iconClass,
    title,
    subtitle,
    value,
    grade,
    accent,
}: {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    title: string;
    subtitle: string;
    value?: number;
    grade?: string;
    accent: 'red' | 'orange';
}) {
    const cfg = gradeConfig(grade);
    const pct = value != null ? Math.min((value / 25) * 100, 100) : 0;

    return (
        <div
            className={cn(
                'rounded-xl border p-5',
                accent === 'red'
                    ? 'border-red-900/30 bg-[#0d1530]'
                    : 'border-orange-900/30 bg-[#0d1530]',
            )}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border',
                            iconClass,
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-200">
                            {title}
                        </p>
                        <p className="text-[11px] text-slate-600">{subtitle}</p>
                    </div>
                </div>
                <GradeBadge grade={grade} />
            </div>

            {/* Score */}
            <div className="mb-3">
                <span className="text-3xl font-bold text-slate-100 tabular-nums">
                    {value != null ? value.toFixed(2) : '—'}
                </span>
                <span className="ml-1.5 text-sm text-slate-600">分</span>
            </div>

            {/* Score bar */}
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-700',
                        cfg ? '' : 'bg-slate-700',
                    )}
                    style={{
                        width: `${pct}%`,
                        backgroundColor: cfg?.hex ?? '#374151',
                    }}
                />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-600">
                满分参考值：25 分
            </p>
        </div>
    );
}
