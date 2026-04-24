import { Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import { YearSelect } from '../components';
import { NormScoringModal } from '../modals/NormScoringModal';
import { StartScoringModal } from '../modals/StartScoringModal';
import type { NormRow } from '../types';

export function NormTab() {
    const { activeCompany } = useScope();
    const pid = activeCompany?.id;
    const [year, setYear] = useState(new Date().getFullYear());
    const [rows, setRows] = useState<NormRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [editing, setEditing] = useState<{
        companyId: number;
        companyName: string;
        year: number;
    } | null>(null);

    const fetchRows = useCallback(async () => {
        if (!pid) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<NormRow[]>>(
                '/norm-checks/submissions',
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

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">年度</label>
                        <YearSelect value={year} onChange={setYear} />
                    </div>
                    <p className="text-xs text-slate-500">
                        {year > 2025
                            ? '最终分 = 原始分/100 × 30'
                            : '最终分 = 原始分/100 × 20'}
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

            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="w-20 px-4 py-3">年度</th>
                            <th className="w-24 px-4 py-3">类型</th>
                            <th className="w-24 px-4 py-3">原始分</th>
                            <th className="w-24 px-4 py-3">最终分</th>
                            <th className="w-20 px-4 py-3">打分表</th>
                            <th className="w-32 px-4 py-3 text-right">操作</th>
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
                        {!loading && rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-slate-500"
                                >
                                    暂无大中型企业安全生产标准化管理体系构建记录，点击"开始考核"为下级企业评分。
                                </td>
                            </tr>
                        )}
                        {rows.map((r) => (
                            <tr
                                key={r.id}
                                className="text-slate-200 hover:bg-blue-950/30"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {r.company_name}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.year}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.type}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.raw_number}
                                </td>
                                <td className="px-4 py-3 text-emerald-300">
                                    {r.final_number}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.path ? (
                                        <AttachmentViewer
                                            url={r.path}
                                            label="查看"
                                            className="text-blue-400 hover:text-blue-300"
                                        />
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing({
                                                companyId: r.company_id,
                                                companyName: r.company_name,
                                                year: r.year,
                                            })
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-600/20"
                                    >
                                        修改
                                    </button>
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
                    onStart={(y, id, name) => {
                        setStartOpen(false);
                        setEditing({
                            companyId: id,
                            companyName: name,
                            year: y,
                        });
                    }}
                />
            )}

            {editing && (
                <NormScoringModal
                    companyId={editing.companyId}
                    companyName={editing.companyName}
                    year={editing.year}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await fetchRows();
                    }}
                />
            )}
        </>
    );
}
