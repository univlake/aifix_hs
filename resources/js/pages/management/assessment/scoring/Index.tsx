import { Head } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, Download, FileText, Loader2, Plus, Send, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { uploadToOss } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';
import {
    STATUS_COMPLETED,
    STATUS_SCORED,
    statusLabel,
    statusStyle,
    type DailyCheckRow,
    type DailyCheckTemplateNode,
    type SubmissionRow,
} from '@/pages/assessment/filing/Index';

// ── Shared helpers ────────────────────────────────────────────────

const YEAR_START = 2022;
const inputCls = 'rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function splitPaths(path: string | null | undefined): string[] {
    if (!path) return [];
    return path.split(',').map((s) => s.trim()).filter(Boolean);
}

function fileNameOf(url: string): string {
    try {
        const n = url.split('/').pop() ?? url;
        return decodeURIComponent(n.split('?')[0]);
    } catch {
        return url;
    }
}

function yearOptions(): number[] {
    const current = new Date().getFullYear();
    const out: number[] = [];
    for (let y = current; y >= YEAR_START; y--) out.push(y);
    return out;
}

// ── Tabs ──────────────────────────────────────────────────────────

type TabKey = 'daily' | 'norm' | 'system' | 'accident' | 'points';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'daily', label: '日常目标管理工作' },
    { key: 'norm', label: '大中型企业安全生产标准化管理体系构建' },
    { key: 'system', label: '活动参与及材料上报情况' },
    { key: 'accident', label: '安全生产事故考核指标' },
    { key: 'points', label: '加分项' },
];

export default function AssessmentScoringIndex() {
    const [tab, setTab] = useState<TabKey>('daily');

    return (
        <>
            <Head title="考核评分" />
            <div className="space-y-4 p-4">
                <header className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-600/15">
                        <Trophy className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">考核评分</h1>
                        <p className="text-sm text-slate-400">对所辖下级企业在日常目标管理工作、大中型企业安全生产标准化管理体系构建 、活动参与及材料上报情况 、安全  
  生产安全生产事故考核指标指标 、加分项五个维度进行量化评分。</p>
                    </div>
                </header>

                <nav className="flex gap-2 border-b border-blue-900/40">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'relative -mb-px px-4 py-2 text-sm transition-colors',
                                tab === t.key ? 'border-b-2 border-blue-400 text-slate-100' : 'text-slate-500 hover:text-slate-300',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                {tab === 'daily' && <DailyTab />}
                {tab === 'accident' && <AccidentTab />}
                {tab === 'points' && <PointsTab />}
                {tab === 'norm' && <NormTab />}
                {tab === 'system' && <SystemTab />}
            </div>
        </>
    );
}

// ── 日常目标管理工作 tab (existing) ───────────────────────────────────────

function DailyTab() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [rows, setRows] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState<SubmissionRow | null>(null);

    const fetchRows = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<SubmissionRow[]>>('/daily-checks/submissions', {
                params: { pid: companyId },
            });
            setRows(res.data.data ?? []);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="px-4 py-3 w-20">年度</th>
                            <th className="px-4 py-3">考核</th>
                            <th className="px-4 py-3 w-28">状态</th>
                            <th className="px-4 py-3 w-24">总分</th>
                            <th className="px-4 py-3 w-32">提交时间</th>
                            <th className="px-4 py-3 w-32 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">暂无待评分或已评分的日常目标管理工作记录。</td></tr>}
                        {rows.map((r) => (
                            <tr key={`${r.company_id}-${r.year}`} className="text-slate-200 hover:bg-blue-950/30">
                                <td className="px-4 py-3 font-medium">{r.company_name}</td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3 text-slate-400"><span className="inline-flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />{r.title}</span></td>
                                <td className="px-4 py-3"><span className={cn('inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]', statusStyle(r.status))}>{statusLabel(r.status)}</span></td>
                                <td className="px-4 py-3 text-slate-400">{r.total_number}</td>
                                <td className="px-4 py-3 text-slate-400">{r.updated_at ? String(r.updated_at).slice(0, 10) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setOpened(r)} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20">
                                        {r.status === STATUS_COMPLETED ? '评分' : '查看评分'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {opened && companyId && (
                <DailyScoringDrawer submission={opened} onClose={() => setOpened(null)} onSaved={async () => { setOpened(null); await fetchRows(); }} />
            )}
        </>
    );
}

interface SubmissionDetail {
    company_id: number;
    year: number;
    status: number;
    total_number: number;
    templates: DailyCheckTemplateNode[];
}

function DailyScoringDrawer({ submission, onClose, onSaved }: { submission: SubmissionRow; onClose: () => void; onSaved: () => void }) {
    const readOnly = submission.status === STATUS_SCORED;

    const [detail, setDetail] = useState<SubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<number, { number: number; comment: string }>>({});

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<SubmissionDetail>>('/daily-checks/submission', { params: { company_id: submission.company_id, year: submission.year } })
            .then((res) => {
                if (ignore) return;
                const d = res.data.data;
                setDetail(d);
                const init: Record<number, { number: number; comment: string }> = {};
                for (const top of d.templates ?? []) {
                    for (const child of top.child ?? []) {
                        const c: DailyCheckRow | null | undefined = child.check;
                        init[child.id] = { number: c?.number ?? 0, comment: c?.comment ?? '' };
                    }
                }
                setScores(init);
            })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [submission.company_id, submission.year]);

    const updateScore = (templateId: number, field: 'number' | 'comment', value: string) => {
        setScores((prev) => ({
            ...prev,
            [templateId]: {
                ...(prev[templateId] ?? { number: 0, comment: '' }),
                [field]: field === 'number' ? Math.max(0, Math.round((Number(value) || 0) * 2) / 2) : value,
            },
        }));
    };

    const totalScore = Math.round(Object.values(scores).reduce((s, v) => s + (Number(v.number) || 0), 0) * 10) / 10;

    const submitScore = async () => {
        if (!detail) return;
        setSaving(true);
        setError(null);
        try {
            const items: { daily_check_template_id: number; number: number; comment: string | null }[] = [];
            for (const top of detail.templates) {
                for (const child of top.child ?? []) {
                    const s = scores[child.id];
                    if (!s) continue;
                    items.push({ daily_check_template_id: child.id, number: s.number, comment: s.comment || null });
                }
            }
            await api.post('/daily-checks/score', { company_id: submission.company_id, year: submission.year, items });
            onSaved();
        } catch (e) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            setError(err.response?.data?.message ?? err.message ?? '评分失败');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">{submission.company_name} · {submission.year} 年度考核 {readOnly ? '查看' : '评分'}</h2>
                        <p className="mt-0.5 text-xs text-slate-600">当前总分：{totalScore}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading && <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /></div>}
                    {!loading && error && <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-300">{error}</div>}
                    {!loading && !error && detail && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        <th className="w-40 border-r border-blue-900/30 px-4 py-3">一级指标</th>
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">二级指标</th>
                                        <th className="w-28 border-r border-blue-900/30 px-4 py-3">评分依据</th>
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">填报文件</th>
                                        <th className="w-28 border-r border-blue-900/30 px-4 py-3">得分</th>
                                        <th className="px-4 py-3">评分意见</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {detail.templates.map((top) => {
                                        const children = top.child ?? [];
                                        if (children.length === 0) return null;
                                        return children.map((child, idx) => {
                                            const paths = splitPaths(child.check?.path);
                                            return (
                                                <tr key={child.id}>
                                                    {idx === 0 && <td rowSpan={children.length} className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100">{top.title}</td>}
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">{child.title}</td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">{child.score_range ?? '—'}</td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                        {paths.length === 0 ? <span className="text-xs text-slate-600">未上传</span> : (
                                                            <ul className="space-y-1">
                                                                {paths.map((p, i) => (
                                                                    <li key={`${p}-${i}`} className="flex items-center gap-1.5 text-xs">
                                                                        <FileText className="h-3 w-3 shrink-0 text-blue-400" />
                                                                        <a href={p} target="_blank" rel="noopener noreferrer" className="truncate text-blue-400 hover:text-blue-300">{fileNameOf(p)}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                        <input type="number" min={0} step={0.5} disabled={readOnly} value={scores[child.id]?.number ?? 0} onChange={(e) => updateScore(child.id, 'number', e.target.value)} className="w-24 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-sm text-slate-200 outline-none focus:border-blue-500/60 disabled:opacity-60" />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <textarea disabled={readOnly} value={scores[child.id]?.comment ?? ''} onChange={(e) => updateScore(child.id, 'comment', e.target.value)} placeholder="评分意见" className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500/60 disabled:opacity-60" rows={2} />
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!readOnly && (
                    <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                        <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-300 hover:bg-blue-900/20">取消</button>
                        <button type="button" onClick={submitScore} disabled={saving || loading} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-40">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}提交评分
                        </button>
                    </div>
                )}
                {readOnly && <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />已完成评分</div>}
            </div>
        </div>
    );
}

// ── Shared: year selector + subordinate picker ────────────────────

function YearSelect({ value, onChange }: { value: number; onChange: (y: number) => void }) {
    return (
        <select className={cn(inputCls, 'w-28')} value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
            {yearOptions().map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
    );
}

/**
 * Shared modal: choose year + subordinate, then launch the scoring flow.
 */
function StartScoringModal({ title, onClose, onStart }: {
    title: string;
    onClose: () => void;
    onStart: (year: number, companyId: number, companyName: string) => void;
}) {
    const { subordinates } = useScope();
    const [year, setYear] = useState(new Date().getFullYear());
    const [companyId, setCompanyId] = useState<number | null>(null);

    const picked = useMemo(() => subordinates.find((s) => s.id === companyId), [subordinates, companyId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </header>

                <div className="space-y-3">
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">考核年度</span>
                        <select className={cn(inputCls, 'w-full')} value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
                            {yearOptions().map((y) => (<option key={y} value={y}>{y}</option>))}
                        </select>
                    </label>
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">下级企业</span>
                        <select
                            className={cn(inputCls, 'w-full')}
                            value={companyId ? String(companyId) : ''}
                            onChange={(e) => setCompanyId(Number(e.target.value))}
                        >
                            <option value="">选择企业</option>
                            {subordinates.map((s) => (<option key={s.id} value={String(s.id)}>{s.title}</option>))}
                        </select>
                    </label>
                </div>

                <footer className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20">取消</button>
                    <button
                        type="button"
                        disabled={!picked}
                        onClick={() => picked && onStart(year, picked.id, picked.title)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        开始考核
                    </button>
                </footer>
            </div>
        </div>
    );
}

// ── 安全生产事故考核指标 tab ──────────────────────────────────────────────────

interface AccidentRow {
    company_id: number;
    company_name: string;
    year: number;
    raw_number: number;
    final_number: number;
    row_count: number;
    updated_at: string | null;
    title: string;
}

function AccidentTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<AccidentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [scoring, setScoring] = useState<{ companyId: number; companyName: string; year: number } | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<AccidentRow[]>>('/accident-checks/submissions', { params: { pid, year } });
            setRows(res.data.data ?? []);
        } finally { setLoading(false); }
    }, [pid, year]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">最终分 = max(0, 20 - 累计扣分)</p>
                </div>
                <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30"
                >
                    <Plus className="h-4 w-4" />开始考核
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="px-4 py-3 w-20">年度</th>
                            <th className="px-4 py-3 w-24">累计扣分</th>
                            <th className="px-4 py-3 w-24">最终分</th>
                            <th className="px-4 py-3 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">暂无安全生产事故考核指标记录，点击"开始考核"为下级企业评分。</td></tr>}
                        {rows.map((r) => (
                            <tr key={`${r.company_id}-${r.year}`} className="text-slate-200 hover:bg-blue-950/30">
                                <td className="px-4 py-3 font-medium">{r.company_name}</td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3 text-slate-400">{r.raw_number}</td>
                                <td className="px-4 py-3 text-emerald-300">{r.final_number}</td>
                                <td className="px-4 py-3 text-slate-400">{r.updated_at ? String(r.updated_at).slice(0, 10) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setScoring({ companyId: r.company_id, companyName: r.company_name, year: r.year })} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20">修改评分</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {startOpen && (
                <StartScoringModal
                    title="开始安全生产事故考核指标"
                    onClose={() => setStartOpen(false)}
                    onStart={(y, id, name) => { setStartOpen(false); setScoring({ companyId: id, companyName: name, year: y }); }}
                />
            )}

            {scoring && (
                <TemplateScoringDrawer
                    kind="accident"
                    companyId={scoring.companyId}
                    companyName={scoring.companyName}
                    year={scoring.year}
                    onClose={() => setScoring(null)}
                    onSaved={async () => { setScoring(null); await fetchRows(); }}
                />
            )}
        </>
    );
}

// ── 加分项 tab ────────────────────────────────────────────────────

interface PointsRow {
    company_id: number;
    company_name: string;
    year: number;
    total_number: number;
    row_count: number;
    updated_at: string | null;
    title: string;
}

function PointsTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<PointsRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [scoring, setScoring] = useState<{ companyId: number; companyName: string; year: number } | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<PointsRow[]>>('/add-points/submissions', { params: { pid, year } });
            setRows(res.data.data ?? []);
        } finally { setLoading(false); }
    }, [pid, year]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">加分项最终分 = 累计加分</p>
                </div>
                <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30"
                >
                    <Plus className="h-4 w-4" />开始考核
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="px-4 py-3 w-20">年度</th>
                            <th className="px-4 py-3 w-24">累计加分</th>
                            <th className="px-4 py-3 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">暂无加分项记录，点击"开始考核"为下级企业评分。</td></tr>}
                        {rows.map((r) => (
                            <tr key={`${r.company_id}-${r.year}`} className="text-slate-200 hover:bg-blue-950/30">
                                <td className="px-4 py-3 font-medium">{r.company_name}</td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3 text-emerald-300">{r.total_number}</td>
                                <td className="px-4 py-3 text-slate-400">{r.updated_at ? String(r.updated_at).slice(0, 10) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setScoring({ companyId: r.company_id, companyName: r.company_name, year: r.year })} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20">修改评分</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {startOpen && (
                <StartScoringModal
                    title="开始加分项考核"
                    onClose={() => setStartOpen(false)}
                    onStart={(y, id, name) => { setStartOpen(false); setScoring({ companyId: id, companyName: name, year: y }); }}
                />
            )}

            {scoring && (
                <TemplateScoringDrawer
                    kind="points"
                    companyId={scoring.companyId}
                    companyName={scoring.companyName}
                    year={scoring.year}
                    onClose={() => setScoring(null)}
                    onSaved={async () => { setScoring(null); await fetchRows(); }}
                />
            )}
        </>
    );
}

// ── Shared template-based scoring drawer (Accident + AddPoints) ──

interface TemplateCheck {
    id?: number;
    number: number | string;
    comment: string | null;
}

interface SimpleTemplateNode {
    id: number;
    title: string;
    level: number;
    sort: number;
    score_range: string | null;
    child?: SimpleTemplateNode[];
    check?: TemplateCheck | null;
}

function TemplateScoringDrawer({ kind, companyId, companyName, year, onClose, onSaved }: {
    kind: 'accident' | 'points';
    companyId: number;
    companyName: string;
    year: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const endpoint = kind === 'accident' ? '/accident-checks/start-form' : '/add-points/start-form';
    const saveEndpoint = kind === 'accident' ? '/accident-checks/save-score' : '/add-points/save-score';
    const templateKey = kind === 'accident' ? 'accident_check_template_id' : 'add_points_template_id';

    const [tree, setTree] = useState<SimpleTemplateNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<number, { number: number; comment: string }>>({});

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<SimpleTemplateNode[]>>(endpoint, { params: { company_id: companyId, year } })
            .then((res) => {
                if (ignore) return;
                const data = res.data.data ?? [];
                setTree(data);
                const init: Record<number, { number: number; comment: string }> = {};
                if (kind === 'accident') {
                    for (const top of data) {
                        for (const child of top.child ?? []) {
                            init[child.id] = { number: Number(child.check?.number ?? 0), comment: child.check?.comment ?? '' };
                        }
                    }
                } else {
                    for (const node of data) {
                        init[node.id] = { number: Number(node.check?.number ?? 0), comment: node.check?.comment ?? '' };
                    }
                }
                setScores(init);
            })
            .catch((e) => {
                const err = e as { response?: { data?: { message?: string } }; message?: string };
                if (!ignore) setError(err.response?.data?.message ?? err.message ?? '加载失败');
            })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [endpoint, companyId, year, kind]);

    const update = (id: number, field: 'number' | 'comment', value: string) => {
        setScores((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? { number: 0, comment: '' }),
                [field]: field === 'number' ? Math.max(0, Math.round((Number(value) || 0) * 2) / 2) : value,
            },
        }));
    };

    const total = Math.round(Object.values(scores).reduce((s, v) => s + (Number(v.number) || 0), 0) * 10) / 10;

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            const items: { number: number; comment: string | null; [key: string]: unknown }[] = [];
            if (kind === 'accident') {
                for (const top of tree) {
                    for (const child of top.child ?? []) {
                        const s = scores[child.id];
                        if (!s) continue;
                        items.push({ [templateKey]: child.id, number: s.number, comment: s.comment || null });
                    }
                }
            } else {
                for (const node of tree) {
                    const s = scores[node.id];
                    if (!s) continue;
                    items.push({ [templateKey]: node.id, number: s.number, comment: s.comment || null });
                }
            }
            await api.post(saveEndpoint, { company_id: companyId, year, items });
            onSaved();
        } catch (e) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            setError(err.response?.data?.message ?? err.message ?? '保存失败');
        } finally { setSaving(false); }
    };

    const rows = useMemo(() => {
        const out: { parent: SimpleTemplateNode; child: SimpleTemplateNode; idx: number; spanCount: number }[] = [];
        if (kind === 'accident') {
            for (const top of tree) {
                const children = top.child ?? [];
                children.forEach((child, idx) => out.push({ parent: top, child, idx, spanCount: children.length }));
            }
        } else {
            for (const node of tree) {
                out.push({ parent: node, child: node, idx: 0, spanCount: 1 });
            }
        }
        return out;
    }, [tree, kind]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">{companyName} · {year} 年度 {kind === 'accident' ? '安全生产事故考核指标评分' : '加分项评分'}</h2>
                        <p className="mt-0.5 text-xs text-slate-600">当前合计：{total}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading && <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /></div>}
                    {!loading && error && <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-300">{error}</div>}
                    {!loading && !error && tree.length === 0 && (
                        <div className="rounded-lg border border-blue-900/40 bg-[#0b1226] p-6 text-center text-sm text-slate-500">{year} 年度暂无评分模板，请联系管理员配置。</div>
                    )}
                    {!loading && !error && tree.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        {kind === 'accident' && <th className="w-40 border-r border-blue-900/30 px-4 py-3">一级指标</th>}
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">{kind === 'accident' ? '二级指标' : '指标'}</th>
                                        <th className="w-32 border-r border-blue-900/30 px-4 py-3">评分依据</th>
                                        <th className="w-24 border-r border-blue-900/30 px-4 py-3">分值</th>
                                        <th className="px-4 py-3">评分意见</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {rows.map(({ parent, child, idx, spanCount }) => (
                                        <tr key={`${parent.id}-${child.id}`}>
                                            {kind === 'accident' && idx === 0 && (
                                                <td rowSpan={spanCount} className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100">{parent.title}</td>
                                            )}
                                            <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">{child.title}</td>
                                            <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">{child.score_range ?? '—'}</td>
                                            <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                <input type="number" min={0} step={0.5} value={scores[child.id]?.number ?? 0} onChange={(e) => update(child.id, 'number', e.target.value)} className="w-24 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-sm text-slate-200 outline-none focus:border-blue-500/60" />
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <textarea value={scores[child.id]?.comment ?? ''} onChange={(e) => update(child.id, 'comment', e.target.value)} placeholder="评分意见" className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500/60" rows={2} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-300 hover:bg-blue-900/20">取消</button>
                    <button type="button" onClick={save} disabled={saving || loading || tree.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-40">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}保存评分
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── 大中型企业安全生产标准化管理体系构建 tab ────────────────────────────────────────────────

interface NormRow {
    id: number;
    company_id: number;
    company_name: string;
    year: number;
    type: string;
    raw_number: number;
    final_number: number;
    path: string | null;
    updated_at: string | null;
}

const NORM_TYPES = ['机械', '造纸', '危化', '其他'];

function NormTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<NormRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [editing, setEditing] = useState<{ companyId: number; companyName: string; year: number } | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<NormRow[]>>('/norm-checks/submissions', { params: { pid, year } });
            setRows(res.data.data ?? []);
        } finally { setLoading(false); }
    }, [pid, year]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">{year > 2025 ? '最终分 = 原始分/100 × 30' : '最终分 = 原始分/100 × 20'}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30"
                >
                    <Plus className="h-4 w-4" />开始考核
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="px-4 py-3 w-20">年度</th>
                            <th className="px-4 py-3 w-24">类型</th>
                            <th className="px-4 py-3 w-24">原始分</th>
                            <th className="px-4 py-3 w-24">最终分</th>
                            <th className="px-4 py-3 w-20">打分表</th>
                            <th className="px-4 py-3 w-32 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">暂无大中型企业安全生产标准化管理体系构建记录，点击"开始考核"为下级企业评分。</td></tr>}
                        {rows.map((r) => (
                            <tr key={r.id} className="text-slate-200 hover:bg-blue-950/30">
                                <td className="px-4 py-3 font-medium">{r.company_name}</td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3 text-slate-400">{r.type}</td>
                                <td className="px-4 py-3 text-slate-400">{r.raw_number}</td>
                                <td className="px-4 py-3 text-emerald-300">{r.final_number}</td>
                                <td className="px-4 py-3 text-slate-400">{r.path ? <a href={r.path} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">查看</a> : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setEditing({ companyId: r.company_id, companyName: r.company_name, year: r.year })} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-600/20">修改</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {startOpen && (
                <StartScoringModal
                    title="开始大中型企业安全生产标准化管理体系构建"
                    onClose={() => setStartOpen(false)}
                    onStart={(y, id, name) => { setStartOpen(false); setEditing({ companyId: id, companyName: name, year: y }); }}
                />
            )}

            {editing && (
                <NormScoringModal
                    companyId={editing.companyId}
                    companyName={editing.companyName}
                    year={editing.year}
                    onClose={() => setEditing(null)}
                    onSaved={async () => { setEditing(null); await fetchRows(); }}
                />
            )}
        </>
    );
}

function NormScoringModal({ companyId, companyName, year, onClose, onSaved }: { companyId: number; companyName: string; year: number; onClose: () => void; onSaved: () => void }) {
    const [type, setType] = useState<string>(NORM_TYPES[0]);
    const [number, setNumber] = useState<string>('0');
    const [path, setPath] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const url = await uploadToOss(file, `uploads/norm-checks/${companyId}/${year}/`);
            setPath(url);
        } catch (e) {
            const err = e as { message?: string };
            setError(err.message ?? '上传失败');
        } finally { setUploading(false); }
    };

    const downloadTemplate = async () => {
        setTemplateLoading(true);
        setError(null);
        try {
            const res = await api.get<ApiResponse<{ url: string; type: string }>>('/norm-checks/template-link', {
                params: { type },
            });
            const url = res.data.data?.url;
            if (!url) throw new Error('模板地址为空');
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.download = url.split('/').pop() ?? '考核表模板';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            setError(err.response?.data?.message ?? err.message ?? '下载模板失败');
        } finally { setTemplateLoading(false); }
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await api.post('/norm-checks/save-score', { company_id: companyId, year, type, number: Number(number) || 0, path: path || null });
            onSaved();
        } catch (e) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            setError(err.response?.data?.message ?? err.message ?? '保存失败');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">{companyName} · {year} 年大中型企业安全生产标准化管理体系构建</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </header>

                <div className="space-y-3">
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 flex items-center justify-between">
                            <span>企业类型</span>
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                disabled={templateLoading}
                                className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/10 px-2 py-0.5 text-[11px] text-blue-300 transition-colors hover:bg-blue-600/20 disabled:opacity-40"
                            >
                                {templateLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                                下载考核表模板
                            </button>
                        </span>
                        <select className={cn(inputCls, 'w-full')} value={type} onChange={(e) => setType(e.target.value)}>
                            {NORM_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                    </label>
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">原始分（0 - 100）</span>
                        <input type="number" min={0} max={100} step={0.5} className={cn(inputCls, 'w-full')} value={number} onChange={(e) => setNumber(e.target.value)} />
                    </label>
                    <div>
                        <p className="mb-1 text-xs text-slate-400">打分表上传</p>
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200">
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                            {uploading ? '上传中...' : path ? '重新上传' : '上传文件'}
                            <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }} disabled={uploading} />
                        </label>
                        {path && (
                            <p className="mt-1 text-xs"><a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">{fileNameOf(path)}</a></p>
                        )}
                    </div>
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20">取消</button>
                    <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}保存评分
                    </button>
                </footer>
            </div>
        </div>
    );
}

// ── 活动参与及材料上报情况 tab ──────────────────────────────────────────────────

interface SystemRow {
    id: number;
    company_id: number;
    company_name: string;
    year: number;
    number: number;
    number_v1: number;
    number_v2: number;
    number_v3: number;
    number_v4: number;
    number_v5: number;
    updated_at: string | null;
}

function SystemTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<SystemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [computing, setComputing] = useState<number | null>(null);
    const [startOpen, setStartOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) return;
        setLoading(true);
        try {
            const res = await api.get<ApiResponse<SystemRow[]>>('/system-checks/submissions', { params: { pid, year } });
            setRows(res.data.data ?? []);
        } finally { setLoading(false); }
    }, [pid, year]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    const compute = async (companyId: number, targetYear: number) => {
        setComputing(companyId);
        setError(null);
        try {
            await api.post('/system-checks/compute', { company_id: companyId, year: targetYear });
            if (targetYear !== year) setYear(targetYear);
            await fetchRows();
        } catch (e) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            setError(err.response?.data?.message ?? err.message ?? '计算失败');
        } finally { setComputing(null); }
    };

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">体系分由月报 / 任务反馈 / 信息稿件自动计算（v1+v4+v5）</p>
                </div>
                <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30"
                >
                    <Plus className="h-4 w-4" />开始考核
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-600/8 p-4 text-sm text-red-400">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="px-4 py-3 w-20">年度</th>
                            <th className="px-4 py-3 w-20">月报 v1</th>
                            <th className="px-4 py-3 w-20">任务 v4</th>
                            <th className="px-4 py-3 w-20">稿件 v5</th>
                            <th className="px-4 py-3 w-20">合计</th>
                            <th className="px-4 py-3 w-32">更新时间</th>
                            <th className="px-4 py-3 w-32 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">暂无活动参与及材料上报情况记录，点击"开始考核"为下级企业计算评分。</td></tr>}
                        {rows.map((r) => (
                            <tr key={`${r.company_id}-${r.year}`} className="text-slate-200 hover:bg-blue-950/30">
                                <td className="px-4 py-3 font-medium">{r.company_name}</td>
                                <td className="px-4 py-3 text-slate-400">{r.year}</td>
                                <td className="px-4 py-3 text-slate-400">{r.number_v1}</td>
                                <td className="px-4 py-3 text-slate-400">{r.number_v4}</td>
                                <td className="px-4 py-3 text-slate-400">{r.number_v5}</td>
                                <td className="px-4 py-3 text-emerald-300">{r.number}</td>
                                <td className="px-4 py-3 text-slate-400">{r.updated_at ? String(r.updated_at).slice(0, 10) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => compute(r.company_id, r.year)}
                                        disabled={computing === r.company_id}
                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-600/20 disabled:opacity-40"
                                    >
                                        {computing === r.company_id && <Loader2 className="h-3 w-3 animate-spin" />}
                                        重新计算
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {startOpen && (
                <StartScoringModal
                    title="开始活动参与及材料上报情况"
                    onClose={() => setStartOpen(false)}
                    onStart={(y, id) => { setStartOpen(false); compute(id, y); }}
                />
            )}
        </>
    );
}
