import { Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import { YearSelect } from '../components';
import { StartScoringModal } from '../modals/StartScoringModal';
import type { SystemRow } from '../types';

export function SystemTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<SystemRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [computing, setComputing] = useState<number | null>(null);
    const [startOpen, setStartOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<SystemRow[]>>(
                '/system-checks/submissions',
                { params: { pid, year } },
            );
            setRows(res.data.data ?? []);
        } finally {
            setLoading(false);
        }
    }, [pid, year]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const compute = async (companyId: number, targetYear: number) => {
        setComputing(companyId);
        setError(null);

        try {
            await api.post('/system-checks/compute', {
                company_id: companyId,
                year: targetYear,
            });

            if (targetYear !== year) {
                setYear(targetYear);
            }

            await fetchRows();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '计算失败');
        } finally {
            setComputing(null);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">
                        体系分由月报 / 任务反馈 / 信息稿件自动计算（v1+v4+v5）
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/30"
                >
                    <Plus className="h-4 w-4" />
                    开始考核
                </button>
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
                            <th className="w-20 px-4 py-3">年度</th>
                            <th className="w-20 px-4 py-3">月报 v1</th>
                            <th className="w-20 px-4 py-3">任务 v4</th>
                            <th className="w-20 px-4 py-3">稿件 v5</th>
                            <th className="w-20 px-4 py-3">合计</th>
                            <th className="w-32 px-4 py-3">更新时间</th>
                            <th className="w-32 px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30">
                        {loading && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 text-center text-slate-500"
                                >
                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                </td>
                            </tr>
                        )}
                        {!loading && rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 text-center text-slate-500"
                                >
                                    暂无活动参与及材料上报情况记录，点击"开始考核"为下级企业计算评分。
                                </td>
                            </tr>
                        )}
                        {rows.map((r) => (
                            <tr
                                key={`${r.company_id}-${r.year}`}
                                className="text-slate-200 hover:bg-blue-950/30"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {r.company_name}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.year}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.number_v1}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.number_v4}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.number_v5}
                                </td>
                                <td className="px-4 py-3 text-emerald-300">
                                    {r.number}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.updated_at
                                        ? String(r.updated_at).slice(0, 10)
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            compute(r.company_id, r.year)
                                        }
                                        disabled={computing === r.company_id}
                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-600/20 disabled:opacity-40"
                                    >
                                        {computing === r.company_id && (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        )}
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
                    onStart={(y, id) => {
                        setStartOpen(false);
                        compute(id, y);
                    }}
                />
            )}
        </>
    );
}
