import { ClipboardList, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import {
    STATUS_COMPLETED,
    statusLabel,
    statusStyle,
    type SubmissionRow,
} from '@/pages/assessment/filing/Index';
import type { ApiResponse } from '@/types/models';
import { DailyScoringDrawer } from '../drawers/DailyScoringDrawer';

export function DailyTab() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [rows, setRows] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState<SubmissionRow | null>(null);

    const fetchRows = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<SubmissionRow[]>>(
                '/daily-checks/submissions',
                {
                    params: { pid: companyId },
                },
            );
            setRows(res.data.data ?? []);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#070d1f]">
                <table className="min-w-full text-sm">
                    <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                        <tr>
                            <th className="px-4 py-3">企业</th>
                            <th className="w-20 px-4 py-3">年度</th>
                            <th className="px-4 py-3">考核</th>
                            <th className="w-28 px-4 py-3">状态</th>
                            <th className="w-24 px-4 py-3">总分</th>
                            <th className="w-32 px-4 py-3">提交时间</th>
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
                                    暂无待评分或已评分的日常目标管理工作记录。
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
                                    <span className="inline-flex items-center gap-1.5">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        {r.title}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]',
                                            statusStyle(r.status),
                                        )}
                                    >
                                        {statusLabel(r.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.total_number}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {r.updated_at
                                        ? String(r.updated_at).slice(0, 10)
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setOpened(r)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs text-blue-300 transition-colors hover:bg-blue-600/20"
                                    >
                                        {r.status === STATUS_COMPLETED
                                            ? '评分'
                                            : '查看评分'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {opened && companyId && (
                <DailyScoringDrawer
                    submission={opened}
                    onClose={() => setOpened(null)}
                    onSaved={async () => {
                        setOpened(null);
                        await fetchRows();
                    }}
                />
            )}
        </>
    );
}
