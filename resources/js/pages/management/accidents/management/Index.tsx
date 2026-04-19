import { Head } from '@inertiajs/react';
import { Activity, List, Loader2, ChevronLeft, ChevronRight, X, Pencil, Trash2, Eye, AlertTriangle, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OssUploadField } from '@/components/shared/OssUploadField';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

interface AnnualStat {
    year: string;
    accident_count: number;
    hurt_count: number;
    death_count: number;
}

interface AccidentRow {
    id: number;
    company_id: number;
    user_id: number | null;
    happen_time: string | null;
    type: string | null;
    accident_level: string | null;
    degree_injury: string | null;
    staff_die: number;
    staff_hurt: number;
    not_staff_die: number;
    not_staff_hurt: number;
    department: string | null;
    happen_area: string | null;
    company: { id: number; title: string } | null;
}

interface KidRow {
    id?: number;
    name: string | null;
    sex: string | null;
    age: string | null;
    department: string | null;
    work_type: string | null;
    work_age: string | null;
    education_level: string | null;
    degree_injury: string | null;
    days_off: string | null;
}

interface AccidentFull extends AccidentRow {
    content: string | null;
    direct_cause: string | null;
    indirect_cause: string | null;
    direct_loss_property: string | null;
    gauge_loss_property: string | null;
    accident_report_url: string | null;
    accident_photo_url: string | null;
    kids: KidRow[];
}

// ── Enum options ───────────────────────────────────────────────────

const TYPE_OPTIONS = [
    '物体打击', '车辆伤害', '机械伤害', '起重伤害', '触电', '溺水', '灼烫', '火灾',
    '高处堕落', '坍塌', '冒顶片帮', '透水', '放炮', '火药爆炸', '瓦斯爆炸', '锅炉爆炸',
    '容器爆炸', '其他爆炸', '中毒和窒息', '其他伤害',
];

const LEVEL_OPTIONS = [
    '未遂事故', '轻伤事故', '重伤事故', '一般事故', '较大事故', '重大事故', '特别重大事故',
];

const DIRECT_CAUSE_OPTIONS = [
    '操作错误/忽视安全/忽视警告', '安全装置失效', '使用不安全设备', '手代替工具操作',
    '物体存放不当', '攀坐不安全位置', '冒险进入危险场所', '在起吊物下作业停留',
    '机器运转时加油修理检查调整焊接清扫等', '忽视个人防护用品使用', '有分散注意力行为',
    '不安全装束', '易燃易爆等危险物品处理错误', '防护保险信号等装置缺乏或有缺陷',
    '设备设施工具有缺陷', '个人防护用品用具缺少或有缺陷', '生产施工场地环境不良',
];

const INDIRECT_CAUSE_OPTIONS = [
    '技术和设计有缺陷', '设备设施工具有缺陷', '防护保险信号等装置缺乏或有缺陷',
    '生产场所环境不良', '个人防护用品缺少或有缺陷', '没有安全操作规程或不健全',
    '违反操作规程或劳动纪律', '劳动组织不合理', '对现场工作缺乏检查或指挥有错误',
    '教育培训不够缺乏安全操作知识', '其他',
];

const DEGREE_INJURY_OPTIONS = [
    '死亡3人及以上事故', '死亡1-2人事故', '火灾爆炸中毒引起的未造成人员死亡事故',
    '重伤', '轻伤', '未遂',
];

// ── Annual Chart ───────────────────────────────────────────────────

const CHART_W = 800;
const CHART_H = 280;
const PAD = { top: 24, right: 24, bottom: 48, left: 56 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const SERIES = [
    { key: 'accident_count' as const, label: '事故数', color: '#3b82f6', shape: 'bar' },
    { key: 'hurt_count' as const, label: '受伤人数', color: '#f59e0b', shape: 'line' },
    { key: 'death_count' as const, label: '死亡人数', color: '#ef4444', shape: 'line' },
];

function AnnualChart({ data, loading }: { data: AnnualStat[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                暂无事故记录
            </div>
        );
    }

    const years = data.map((d) => d.year);
    const maxVal = Math.max(
        1,
        ...data.flatMap((d) => [d.accident_count, d.hurt_count, d.death_count]),
    );
    const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
    const gridLines = 5;

    const xStep = PLOT_W / Math.max(years.length, 1);
    const barW = Math.min(xStep * 0.4, 40);

    const toX = (i: number) => PAD.left + i * xStep + xStep / 2;
    const toY = (v: number) => PAD.top + PLOT_H - (v / niceMax) * PLOT_H;

    return (
        <div className="w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full"
                style={{ minWidth: 480 }}
            >
                {/* Grid */}
                {Array.from({ length: gridLines + 1 }, (_, i) => {
                    const y = PAD.top + (PLOT_H / gridLines) * i;
                    const val = Math.round(niceMax * (1 - i / gridLines));

                    return (
                        <g key={i}>
                            <line
                                x1={PAD.left}
                                y1={y}
                                x2={PAD.left + PLOT_W}
                                y2={y}
                                stroke="#1e3a5f"
                                strokeWidth="1"
                                strokeDasharray={i === gridLines ? 'none' : '4 3'}
                            />
                            <text
                                x={PAD.left - 6}
                                y={y + 4}
                                textAnchor="end"
                                fill="#475569"
                                fontSize="11"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Bars for accident_count */}
                {data.map((d, i) => {
                    const h = (d.accident_count / niceMax) * PLOT_H;
                    const cx = toX(i);

                    return (
                        <rect
                            key={d.year}
                            x={cx - barW / 2}
                            y={PAD.top + PLOT_H - h}
                            width={barW}
                            height={Math.max(h, 0)}
                            fill="#3b82f680"
                            rx="3"
                        />
                    );
                })}

                {/* Lines for hurt_count and death_count */}
                {(['hurt_count', 'death_count'] as const).map((key) => {
                    const color = SERIES.find((s) => s.key === key)!.color;
                    const pts = data.map((d, i) => `${toX(i)},${toY(d[key])}`).join(' ');

                    return (
                        <g key={key}>
                            <polyline
                                points={pts}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {data.map((d, i) => (
                                <circle
                                    key={i}
                                    cx={toX(i)}
                                    cy={toY(d[key])}
                                    r="4"
                                    fill={color}
                                    stroke="#0d1530"
                                    strokeWidth="1.5"
                                />
                            ))}
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {years.map((y, i) => (
                    <text
                        key={y}
                        x={toX(i)}
                        y={PAD.top + PLOT_H + 16}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="12"
                    >
                        {y}
                    </text>
                ))}

                {/* Baseline */}
                <line
                    x1={PAD.left}
                    y1={PAD.top + PLOT_H}
                    x2={PAD.left + PLOT_W}
                    y2={PAD.top + PLOT_H}
                    stroke="#1e3a5f"
                    strokeWidth="1"
                />
            </svg>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-6">
                {SERIES.map((s) => (
                    <div key={s.key} className="flex items-center gap-1.5">
                        {s.shape === 'bar' ? (
                            <span
                                className="inline-block h-3 w-4 rounded-sm"
                                style={{ background: s.color + '80' }}
                            />
                        ) : (
                            <span className="flex items-center gap-1">
                                <span
                                    className="inline-block h-0.5 w-4"
                                    style={{ background: s.color }}
                                />
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ background: s.color }}
                                />
                            </span>
                        )}
                        <span className="text-xs text-slate-400">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Detail / Edit Panel ────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
    type: '事故类型',
    accident_level: '事故等级',
    happen_time: '发生时间',
    department: '发生部门',
    happen_area: '发生地点',
    degree_injury: '伤亡程度',
    direct_cause: '直接原因',
    indirect_cause: '间接原因',
    staff_die: '员工死亡',
    staff_hurt: '员工受伤',
    not_staff_die: '非员工死亡',
    not_staff_hurt: '非员工受伤',
    direct_loss_property: '直接经济损失(万元)',
    gauge_loss_property: '间接经济损失(万元)',
    content: '事故经过',
    accident_report_url: '事故报告',
    accident_photo_url: '现场照片',
};

type EditForm = Omit<AccidentFull, 'id' | 'user_id' | 'company'>;

function toEditForm(detail: AccidentFull): EditForm {
    const { id, user_id, company, ...rest } = detail;

    void id;
    void user_id;
    void company;

    return rest;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

function DetailPanel({
    id,
    onClose,
}: {
    id: number;
    onClose: () => void;
}) {
    const [detail, setDetail] = useState<AccidentFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        queueMicrotask(() => setLoading(true));
        api.get<ApiResponse<AccidentFull>>(`/accident-bulletins/${id}`)
            .then((res) => {
                setDetail(res.data.data);
            })
            .catch(() => setError('加载失败'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/50" onClick={onClose} />

            {/* Panel */}
            <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-100">事故详情</h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading && (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    )}

                    {error && !loading && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    {!loading && detail && (
                        <div className="space-y-5">
                            {/* Basic info grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {(Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[])
                                    .filter((k) => k !== 'content' && k !== 'accident_report_url' && k !== 'accident_photo_url')
                                    .map((key) => {
                                        const val = detail[key as keyof AccidentFull];
                                        const display = val !== null && val !== undefined && val !== ''
                                            ? String(val)
                                            : '—';

                                        return (
                                            <div key={key}>
                                                <p className="text-xs text-slate-600">{FIELD_LABELS[key]}</p>
                                                <p className="mt-0.5 text-sm text-slate-300">{display}</p>
                                            </div>
                                        );
                                    })
                                }
                            </div>

                            {/* Content */}
                            {detail.content && (
                                <div>
                                    <p className="text-xs text-slate-600">{FIELD_LABELS.content}</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">{detail.content}</p>
                                </div>
                            )}

                            {/* Attachments */}
                            {(detail.accident_report_url || detail.accident_photo_url) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {detail.accident_report_url && (
                                        <div>
                                            <p className="text-xs text-slate-600">{FIELD_LABELS.accident_report_url}</p>
                                            <a
                                                href={detail.accident_report_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
                                            >
                                                查看附件
                                            </a>
                                        </div>
                                    )}
                                    {detail.accident_photo_url && (
                                        <div>
                                            <p className="text-xs text-slate-600">{FIELD_LABELS.accident_photo_url}</p>
                                            <a
                                                href={detail.accident_photo_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
                                            >
                                                查看照片
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Kids table */}
                            {detail.kids.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium text-slate-500">伤亡人员明细</p>
                                    <div className="overflow-x-auto rounded-lg border border-blue-900/30">
                                        <table className="min-w-max w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-blue-900/30 bg-[#0a1020]">
                                                    {['姓名', '性别', '年龄', '部门', '工种', '工龄', '文化程度', '伤害程度', '误工天数'].map((h) => (
                                                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detail.kids.map((k, i) => (
                                                    <tr key={i} className="border-b border-blue-900/20 last:border-0">
                                                        {(['name', 'sex', 'age', 'department', 'work_type', 'work_age', 'education_level', 'degree_injury', 'days_off'] as (keyof KidRow)[]).map((f) => (
                                                            <td key={f} className="px-3 py-2 text-slate-400">{k[f] ?? '—'}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EditAccidentModal({
    id,
    open,
    onClose,
    onSaved,
}: {
    id: number;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<EditForm | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLoading(true);
        setError('');
        api.get<ApiResponse<AccidentFull>>(`/accident-bulletins/${id}`)
            .then((res) => setForm(toEditForm(res.data.data)))
            .catch(() => setError('加载失败'))
            .finally(() => setLoading(false));
    }, [id, open]);

    const setField = (key: keyof EditForm, value: unknown) => {
        setForm((prev) => prev ? { ...prev, [key]: value } : prev);
    };

    const setKid = (idx: number, key: keyof KidRow, value: string) => {
        setForm((prev) => {
            if (!prev) {
                return prev;
            }

            const kids = prev.kids.map((k, i) => i === idx ? { ...k, [key]: value } : k);

            return { ...prev, kids };
        });
    };

    const addKid = () => {
        setForm((prev) => {
            if (!prev) {
                return prev;
            }

            const blank: KidRow = { name: '', sex: '', age: '', department: '', work_type: '', work_age: '', education_level: '', degree_injury: '', days_off: '' };

            return { ...prev, kids: [...prev.kids, blank] };
        });
    };

    const removeKid = (idx: number) => {
        setForm((prev) => {
            if (!prev) {
                return prev;
            }

            return { ...prev, kids: prev.kids.filter((_, i) => i !== idx) };
        });
    };

    const handleSave = async () => {
        if (!form) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            await api.put(`/accident-bulletins/${id}`, form);
            onSaved();
            onClose();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setError(err?.response?.data?.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">编辑事故记录</h2>
                    <p className="mt-0.5 text-xs text-slate-600">修改现有记录信息</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-6">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    )}

                    {!loading && form && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {([
                                ['type', '事故类型', 'select', false],
                                ['accident_level', '事故等级', 'select', false],
                                ['happen_time', '发生时间', 'date', false],
                                ['department', '发生部门', 'text', false],
                                ['happen_area', '发生地点', 'text', true],
                                ['degree_injury', '伤亡程度', 'select', false],
                                ['direct_cause', '直接原因', 'select', false],
                                ['indirect_cause', '间接原因', 'select', true],
                                ['staff_die', '员工死亡人数', 'number', false],
                                ['staff_hurt', '员工受伤人数', 'number', false],
                                ['not_staff_die', '非员工死亡人数', 'number', false],
                                ['not_staff_hurt', '非员工受伤人数', 'number', false],
                                ['direct_loss_property', '直接经济损失 (万元)', 'text', false],
                                ['gauge_loss_property', '间接经济损失 (万元)', 'text', false],
                            ] as [keyof EditForm, string, string, boolean][]).map(([key, label, type, colSpan]) => {
                                const inputClass = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
                                const selectOptions = key === 'type'
                                    ? TYPE_OPTIONS
                                    : key === 'accident_level'
                                        ? LEVEL_OPTIONS
                                        : key === 'degree_injury'
                                            ? DEGREE_INJURY_OPTIONS
                                            : key === 'direct_cause'
                                                ? DIRECT_CAUSE_OPTIONS
                                                : INDIRECT_CAUSE_OPTIONS;

                                return (
                                    <div key={key} className={colSpan ? 'md:col-span-2' : ''}>
                                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</label>
                                        {type === 'select' ? (
                                            <select
                                                value={String(form[key] ?? '')}
                                                onChange={(e) => setField(key, e.target.value || null)}
                                                className={cn(inputClass, 'cursor-pointer appearance-none')}
                                            >
                                                <option value="" disabled className="bg-[#0d1530]">请选择</option>
                                                {selectOptions.map((option) => (
                                                    <option key={option} value={option} className="bg-[#0d1530]">
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={type}
                                                value={(form[key] as string | number) ?? ''}
                                                onChange={(e) => setField(key, type === 'number' ? e.target.value : e.target.value)}
                                                className={cn(inputClass, type === 'date' ? 'cursor-pointer' : '')}
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">事故经过</label>
                                <textarea
                                    value={form.content ?? ''}
                                    onChange={(e) => setField('content', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 resize-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">事故报告附件</label>
                                <OssUploadField
                                    value={form.accident_report_url ?? ''}
                                    onChange={(url) => setField('accident_report_url', url)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">现场照片</label>
                                <OssUploadField
                                    value={form.accident_photo_url ?? ''}
                                    onChange={(url) => setField('accident_photo_url', url)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">伤亡人员明细</label>
                                <div className="overflow-x-auto rounded-lg border border-blue-900/30">
                                    {form.kids.length > 0 && (
                                        <table className="min-w-max w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                                                    {['姓名', '性别', '年龄', '部门', '工种', '工龄', '文化程度', '伤害程度', '误工天数'].map((header) => (
                                                        <th key={header} className="px-3 py-2 text-left font-medium uppercase tracking-wide text-slate-500">{header}</th>
                                                    ))}
                                                    <th className="w-8 px-2 py-2" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.kids.map((kid, idx) => (
                                                    <tr key={idx} className="border-b border-blue-900/20 last:border-0">
                                                        {(['name', 'sex', 'age', 'department', 'work_type', 'work_age', 'education_level', 'degree_injury', 'days_off'] as (keyof KidRow)[]).map((field) => (
                                                            <td key={field} className="px-2 py-1.5">
                                                                <input
                                                                    type="text"
                                                                    value={String(kid[field] ?? '')}
                                                                    onChange={(e) => setKid(idx, field, e.target.value)}
                                                                    className="w-full rounded border border-blue-900/30 bg-transparent px-2 py-1 text-slate-200 placeholder-slate-700 outline-none focus:border-blue-500/60"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="px-2 py-1.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeKid(idx)}
                                                                className="text-slate-600 hover:text-red-400"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addKid}
                                        className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                                    >
                                        <Plus className="h-3 w-3" />
                                        添加成员
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? '保存中...' : '保存'}
                </button>
            </div>
        </Modal>
    );
}

// ── Level Badge ────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string | null }) {
    if (!level) {
        return <span className="text-slate-700">—</span>;
    }

    const color =
        level === '特别重大事故' ? 'bg-red-600/20 text-red-400 border-red-500/30'
            : level === '重大事故' ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                : level === '较大事故' ? 'bg-amber-600/20 text-amber-400 border-amber-500/30'
                    : level === '一般事故' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-600/20 text-slate-400 border-slate-500/30';

    return (
        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${color}`}>
            {level}
        </span>
    );
}

// ── Accident List ──────────────────────────────────────────────────

function AccidentList({ companyId }: { companyId: number | undefined }) {
    const { user, company } = useAuth();
    const currentUserCompanyId = user?.company_id ?? company?.id ?? null;
    const [rows, setRows] = useState<AccidentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [detailId, setDetailId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteRow, setDeleteRow] = useState<AccidentRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) => String(currentYear - i));

    const fetchRows = async (p: number, type: string, level: string, year: string) => {
        if (!companyId) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<PaginatedData<AccidentRow>>>(
                '/bloc-accident-bulletins',
                {
                    params: {
                        company_id: companyId,
                        page: p,
                        per_page: 15,
                        ...(type ? { type } : {}),
                        ...(level ? { accident_level: level } : {}),
                        ...(year ? { happen_year: year } : {}),
                    },
                },
            );
            const meta = res.data.data;
            setRows(meta.data);
            setLastPage(meta.last_page);
            setTotal(meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchRows(1, filterType, filterLevel, filterYear);
    }, [companyId, filterType, filterLevel, filterYear]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePage = (p: number) => {
        setPage(p);
        fetchRows(p, filterType, filterLevel, filterYear);
    };

    const handleDelete = async () => {
        if (!deleteRow) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/accident-bulletins/${deleteRow.id}`);
            setDeleteRow(null);
            fetchRows(page, filterType, filterLevel, filterYear);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="h-8 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none appearance-none"
                >
                    <option value="">全部年份</option>
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>{y} 年</option>
                    ))}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-8 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none appearance-none"
                >
                    <option value="">全部类型</option>
                    {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="h-8 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2.5 text-sm text-slate-300 outline-none appearance-none"
                >
                    <option value="">全部等级</option>
                    {LEVEL_OPTIONS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
                <span className="ml-auto text-xs text-slate-600">
                    共 <span className="font-medium text-slate-400">{total}</span> 条
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                            {['企业名称', '发生时间', '事故类型', '事故等级', '伤亡程度', '死亡', '受伤', '发生地点', '操作'].map((h, i) => (
                                <th key={i} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="py-16 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-16 text-center text-sm text-slate-600">
                                    暂无事故记录
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const canManage = currentUserCompanyId !== null && Number(row.company_id) === Number(currentUserCompanyId);

                                return (
                                <tr
                                    key={row.id}
                                    className="border-b border-blue-900/20 last:border-0 transition-colors hover:bg-white/[0.02]"
                                >
                                    <td className="max-w-[160px] truncate px-4 py-2.5 text-slate-300" title={row.company?.title ?? ''}>
                                        {row.company?.title ?? <span className="text-slate-700">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {row.happen_time ? row.happen_time.slice(0, 10) : <span className="text-slate-700">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-300">
                                        {row.type ?? <span className="text-slate-700">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <LevelBadge level={row.accident_level} />
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {row.degree_injury ?? <span className="text-slate-700">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-center font-medium text-red-400">
                                        {(row.staff_die ?? 0) + (row.not_staff_die ?? 0) || <span className="text-slate-700">0</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-center font-medium text-amber-400">
                                        {(row.staff_hurt ?? 0) + (row.not_staff_hurt ?? 0) || <span className="text-slate-700">0</span>}
                                    </td>
                                    <td className="max-w-[140px] truncate px-4 py-2.5 text-slate-400" title={row.happen_area ?? ''}>
                                        {row.happen_area ?? <span className="text-slate-700">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-0.5 whitespace-nowrap">
                                            <button
                                                onClick={() => setDetailId(row.id)}
                                                className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                详情
                                            </button>
                                            {canManage && (
                                                <>
                                                    <button
                                                        onClick={() => setEditId(row.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400"
                                                        title="编辑"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteRow(row)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                                        title="删除"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        onClick={() => handlePage(page - 1)}
                        disabled={page <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-500">
                        {page} / {lastPage}
                    </span>
                    <button
                        onClick={() => handlePage(page + 1)}
                        disabled={page >= lastPage}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Detail slide-over */}
            {detailId !== null && (
                <DetailPanel
                    id={detailId}
                    onClose={() => setDetailId(null)}
                />
            )}

            {editId !== null && (
                <EditAccidentModal
                    id={editId}
                    open={editId !== null}
                    onClose={() => setEditId(null)}
                    onSaved={() => {
                        fetchRows(page, filterType, filterLevel, filterYear);
                    }}
                />
            )}

            {deleteRow !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteRow(null)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-blue-900/40 bg-[#070d1f] p-6 shadow-2xl">
                        <h3 className="text-base font-semibold text-slate-100">删除事故记录</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            确认删除这条事故记录吗？删除后将无法恢复。
                        </p>
                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteRow(null)}
                                className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────

type Tab = 'chart' | 'list';

export default function AccidentManagementIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [activeTab, setActiveTab] = useState<Tab>('chart');
    const [chartData, setChartData] = useState<AnnualStat[]>([]);
    const [chartLoading, setChartLoading] = useState(false);

    const prevCompanyId = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!companyId || companyId === prevCompanyId.current) {
            return;
        }

        prevCompanyId.current = companyId;
        queueMicrotask(() => setChartLoading(true));
        api.get<ApiResponse<AnnualStat[]>>('/bloc-accident-bulletins/annual-stats', {
            params: { company_id: companyId },
        })
            .then((res) => setChartData(res.data.data))
            .catch(() => setChartData([]))
            .finally(() => setChartLoading(false));
    }, [companyId]);

    const TABS = useMemo(() => [
        { key: 'chart' as Tab, label: '年度曲线图', icon: Activity },
        { key: 'list' as Tab, label: '事故列表', icon: List },
    ], []);

    return (
        <>
            <Head title="事故应急管理" />

            {/* Tab bar */}
            <div className="-mx-6 -mt-6 mb-6 flex items-center gap-0.5 border-b border-slate-800/80 px-6">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === key
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'chart' && (
                <div>
                    <div className="mb-4">
                        <h1 className="text-lg font-semibold text-slate-100">事故年度趋势</h1>
                        <p className="mt-0.5 text-xs text-slate-600">
                            当前企业及下属企业历年事故数、受伤人数、死亡人数汇总
                        </p>
                    </div>

                    {/* Summary cards */}
                    {!chartLoading && chartData.length > 0 && (() => {
                        const total_accidents = chartData.reduce((s, d) => s + (d.accident_count ?? 0), 0);
                        const total_hurt = chartData.reduce((s, d) => s + (d.hurt_count ?? 0), 0);
                        const total_death = chartData.reduce((s, d) => s + (d.death_count ?? 0), 0);
                        const cards = [
                            { label: '累计事故', value: total_accidents, color: 'text-blue-400' },
                            { label: '累计受伤', value: total_hurt, color: 'text-amber-400' },
                            { label: '累计死亡', value: total_death, color: 'text-red-400' },
                        ];

                        return (
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                {cards.map(({ label, value, color }) => (
                                    <div key={label} className="rounded-xl border border-blue-900/30 bg-[#0d1530]/60 p-4">
                                        <p className="text-xs text-slate-500">{label}</p>
                                        <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    <div className="rounded-xl border border-blue-900/30 bg-[#0d1530]/60 p-5">
                        <AnnualChart data={chartData} loading={chartLoading} />
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <AccidentList companyId={companyId} />
            )}
        </>
    );
}
