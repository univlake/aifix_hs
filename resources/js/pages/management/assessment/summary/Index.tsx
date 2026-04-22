import { Head } from '@inertiajs/react';
import { Download, Eye, Loader2, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';

// ── Types ─────────────────────────────────────────────────────────

interface SummaryRow {
    company_id: number;
    company_name: string;
    year: number;
    type: string;
    number1: number;
    number2: number;
    number3: number;
    number4: number;
    number5: number;
    number6: number;
    number: number;
}

const YEAR_START = 2022;
const inputCls =
    'rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function yearOptions(): number[] {
    const current = new Date().getFullYear();
    const out: number[] = [];

    for (let y = current; y >= YEAR_START; y--) {
        out.push(y);
    }

    return out;
}

const DIMENSIONS: { key: keyof SummaryRow; label: string; max?: string }[] = [
    { key: 'number1', label: '日常目标管理工作', max: '—' },
    {
        key: 'number2',
        label: '大中型企业安全生产标准化管理体系构建',
        max: '20 / 30',
    },
    { key: 'number3', label: '双重预防', max: '10（2026 起取消）' },
    { key: 'number4', label: '活动参与及材料上报情况', max: '12' },
    { key: 'number5', label: '安全生产安全生产事故考核指标指标', max: '20' },
    { key: 'number6', label: '加分项' },
];

// ── Page ──────────────────────────────────────────────────────────

export default function AssessmentSummaryIndex() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;

    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<SummaryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [viewing, setViewing] = useState<SummaryRow | null>(null);
    const [exporting, setExporting] = useState<'bloc' | number | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get<ApiResponse<SummaryRow[]>>(
                '/assessment-summary',
                {
                    params: { company_id: pid, year, type: 'bloc' },
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
    }, [pid, year]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const filtered = useMemo(
        () => rows.slice().sort((a, b) => b.number - a.number),
        [rows],
    );

    const exportFile = async (
        target: 'bloc' | { companyId: number; companyName: string },
    ) => {
        if (!pid) {
            return;
        }

        const isBloc = target === 'bloc';
        setExporting(isBloc ? 'bloc' : target.companyId);

        try {
            const res = await api.get('/assessment-summary/export', {
                params: {
                    company_id: isBloc ? pid : target.companyId,
                    year,
                    type: isBloc ? 'bloc' : 'company',
                },
                responseType: 'blob',
            });
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const parentTitle = activeCompany?.title ?? 'bloc';
            const filename = isBloc
                ? `${parentTitle}-${year}年考核汇总.docx`
                : `${target.companyName}-${year}年考核结果.docx`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (e) {
            const err = e as { message?: string };
            setError(err.message ?? '导出失败');
        } finally {
            setExporting(null);
        }
    };

    return (
        <>
            <Head title="考核汇总" />
            <div className="space-y-4 p-4">
                <header className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-600/15">
                            <Trophy className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-100">
                                考核汇总
                            </h1>
                            <p className="text-sm text-slate-400">
                                汇总下级企业的年度考核总分
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <select
                            className={cn(inputCls, 'w-40')}
                            value={String(year)}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {yearOptions().map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => exportFile('bloc')}
                            disabled={exporting !== null}
                            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-600/25 disabled:opacity-40"
                        >
                            {exporting === 'bloc' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            导出全部
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-600/8 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                            <tr>
                                <th className="w-16 px-4 py-3">排名</th>
                                <th className="px-4 py-3">企业</th>
                                <th className="w-24 px-4 py-3">类型</th>
                                <th className="w-24 px-4 py-3">总分</th>
                                <th className="w-40 px-4 py-3 text-right">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/30">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    </td>
                                </tr>
                            )}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-center text-slate-500"
                                    >
                                        暂无考核数据
                                    </td>
                                </tr>
                            )}
                            {filtered.map((r, i) => (
                                <tr
                                    key={r.company_id}
                                    className="text-slate-200 hover:bg-blue-950/30"
                                >
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                                i === 0
                                                    ? 'bg-amber-500/20 text-amber-300'
                                                    : i === 1
                                                      ? 'bg-slate-400/20 text-slate-200'
                                                      : i === 2
                                                        ? 'bg-orange-600/20 text-orange-300'
                                                        : 'bg-blue-900/30 text-slate-400',
                                            )}
                                        >
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {r.company_name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {r.type}
                                    </td>
                                    <td className="px-4 py-3 text-lg font-semibold text-emerald-300">
                                        {r.number}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setViewing(r)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                详情
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    exportFile({
                                                        companyId: r.company_id,
                                                        companyName:
                                                            r.company_name,
                                                    })
                                                }
                                                disabled={exporting !== null}
                                                title="导出该企业"
                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-emerald-600/10 hover:text-emerald-400 disabled:opacity-40"
                                            >
                                                {exporting === r.company_id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Download className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewing && (
                <SummaryDetailsDrawer
                    row={viewing}
                    onClose={() => setViewing(null)}
                />
            )}
        </>
    );
}

// ── Details Drawer ───────────────────────────────────────────────

function SummaryDetailsDrawer({
    row,
    onClose,
}: {
    row: SummaryRow;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {row.company_name} · {row.year} 年度考核
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            企业类型：{row.type}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-600/10 p-5 text-center">
                        <p className="text-xs text-emerald-300/80">总分</p>
                        <p className="mt-1 text-4xl font-semibold text-emerald-300">
                            {row.number}
                        </p>
                    </div>

                    <div className="space-y-2">
                        {DIMENSIONS.map(({ key, label, max }) => {
                            const value = row[key] as number;

                            return (
                                <div
                                    key={key}
                                    className="flex items-center justify-between rounded-lg border border-blue-900/30 bg-[#0b1226] px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm leading-5 font-medium whitespace-pre-line text-slate-200">
                                            {label}
                                        </p>
                                        {max && (
                                            <p className="text-[11px] text-slate-600">
                                                满分参考：{max}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-lg font-semibold text-slate-100">
                                        {value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
