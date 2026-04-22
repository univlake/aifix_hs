import { Head } from '@inertiajs/react';
import { Loader2, Cog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';

interface SpecialType {
    id: number;
    title: string;
}

interface StatsRow {
    company_id: number;
    company_title: string;
    counts: Record<string, number>;
    total: number;
}

interface StatsData {
    types: SpecialType[];
    rows: StatsRow[];
}

export default function SpecialEquipmentStatsIndex() {
    const { activeCompany } = useScope();
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!activeCompany?.id) {
            return;
        }

        setLoading(true);
        setError('');
        api.get<ApiResponse<StatsData>>('/special-equipment-statistics', {
            params: { company_id: activeCompany.id },
        })
            .then((res) => setData(res.data.data))
            .catch(() => setError('加载失败，请刷新重试'))
            .finally(() => setLoading(false));
    }, [activeCompany?.id]);

    // Column totals
    const colTotals = data
        ? data.types.reduce<Record<string, number>>((acc, t) => {
              acc[t.id] = data.rows.reduce(
                  (sum, row) => sum + (row.counts[t.id] ?? 0),
                  0,
              );

              return acc;
          }, {})
        : {};
    const grandTotal = data
        ? data.rows.reduce((sum, row) => sum + row.total, 0)
        : 0;

    return (
        <>
            <Head title="特种设备数据统计" />

            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-600/15">
                    <Cog className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        特种设备数据统计
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        汇总下属企业各类特种设备数量
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-600/8 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <div className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#0a1428]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-blue-900/30 bg-[#060c1a]">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                        企业名称
                                    </th>
                                    {data.types.map((t) => (
                                        <th
                                            key={t.id}
                                            className="px-4 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase"
                                        >
                                            {t.title}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                                        合计
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/20">
                                {data.rows.map((row, i) => (
                                    <tr
                                        key={row.company_id}
                                        className={
                                            i % 2 === 0
                                                ? 'bg-transparent'
                                                : 'bg-white/[0.015]'
                                        }
                                    >
                                        <td
                                            className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-200"
                                            title={row.company_title}
                                        >
                                            {row.company_title}
                                        </td>
                                        {data.types.map((t) => {
                                            const cnt = row.counts[t.id] ?? 0;

                                            return (
                                                <td
                                                    key={t.id}
                                                    className="px-4 py-3 text-center"
                                                >
                                                    {cnt > 0 ? (
                                                        <span className="inline-flex items-center justify-center rounded-md border border-blue-500/20 bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-300">
                                                            {cnt}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-700">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-center">
                                            {row.total > 0 ? (
                                                <span className="inline-flex items-center justify-center rounded-md border border-slate-500/20 bg-slate-600/10 px-2 py-0.5 text-xs font-semibold text-slate-300">
                                                    {row.total}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">
                                                    0
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Totals row */}
                                <tr className="border-t border-blue-900/40 bg-[#060c1a]">
                                    <td className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                        合计
                                    </td>
                                    {data.types.map((t) => {
                                        const total = colTotals[t.id] ?? 0;

                                        return (
                                            <td
                                                key={t.id}
                                                className="px-4 py-3 text-center"
                                            >
                                                <span
                                                    className={`text-xs font-semibold ${total > 0 ? 'text-slate-200' : 'text-slate-700'}`}
                                                >
                                                    {total}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-bold text-slate-100">
                                            {grandTotal}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {data.rows.length === 0 && (
                        <div className="py-16 text-center text-sm text-slate-600">
                            暂无下属企业数据
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && !data && (
                <div className="py-16 text-center text-sm text-slate-600">
                    暂无数据
                </div>
            )}
        </>
    );
}
