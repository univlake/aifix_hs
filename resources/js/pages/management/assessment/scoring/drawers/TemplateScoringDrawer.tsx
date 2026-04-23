import { Loader2, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import type { SimpleTemplateNode } from '../types';

export function TemplateScoringDrawer({
    kind,
    companyId,
    companyName,
    year,
    onClose,
    onSaved,
}: {
    kind: 'accident' | 'points';
    companyId: number;
    companyName: string;
    year: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const endpoint =
        kind === 'accident'
            ? '/accident-checks/start-form'
            : '/add-points/start-form';
    const saveEndpoint =
        kind === 'accident'
            ? '/accident-checks/save-score'
            : '/add-points/save-score';
    const templateKey =
        kind === 'accident'
            ? 'accident_check_template_id'
            : 'add_points_template_id';

    const [tree, setTree] = useState<SimpleTemplateNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<
        Record<number, { number: number; comment: string }>
    >({});

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<SimpleTemplateNode[]>>(endpoint, {
            params: { company_id: companyId, year },
        })
            .then((res) => {
                if (ignore) {
                    return;
                }

                const data = res.data.data ?? [];
                setTree(data);
                const init: Record<
                    number,
                    { number: number; comment: string }
                > = {};

                if (kind === 'accident') {
                    for (const top of data) {
                        for (const child of top.child ?? []) {
                            init[child.id] = {
                                number: Number(child.check?.number ?? 0),
                                comment: child.check?.comment ?? '',
                            };
                        }
                    }
                } else {
                    for (const node of data) {
                        init[node.id] = {
                            number: Number(node.check?.number ?? 0),
                            comment: node.check?.comment ?? '',
                        };
                    }
                }

                setScores(init);
            })
            .catch((e) => {
                const err = e as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };

                if (!ignore) {
                    setError(
                        err.response?.data?.message ??
                            err.message ??
                            '加载失败',
                    );
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [endpoint, companyId, year, kind]);

    const update = (id: number, field: 'number' | 'comment', value: string) => {
        setScores((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? { number: 0, comment: '' }),
                [field]:
                    field === 'number'
                        ? Math.max(0, Math.round((Number(value) || 0) * 2) / 2)
                        : value,
            },
        }));
    };

    const total =
        Math.round(
            Object.values(scores).reduce(
                (s, v) => s + (Number(v.number) || 0),
                0,
            ) * 10,
        ) / 10;

    const save = async () => {
        setSaving(true);
        setError(null);

        try {
            const items: {
                number: number;
                comment: string | null;
                [key: string]: unknown;
            }[] = [];

            if (kind === 'accident') {
                for (const top of tree) {
                    for (const child of top.child ?? []) {
                        const s = scores[child.id];

                        if (!s) {
                            continue;
                        }

                        items.push({
                            [templateKey]: child.id,
                            number: s.number,
                            comment: s.comment || null,
                        });
                    }
                }
            } else {
                for (const node of tree) {
                    const s = scores[node.id];

                    if (!s) {
                        continue;
                    }

                    items.push({
                        [templateKey]: node.id,
                        number: s.number,
                        comment: s.comment || null,
                    });
                }
            }

            await api.post(saveEndpoint, {
                company_id: companyId,
                year,
                items,
            });
            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    const rows = useMemo(() => {
        const out: {
            parent: SimpleTemplateNode;
            child: SimpleTemplateNode;
            idx: number;
            spanCount: number;
        }[] = [];

        if (kind === 'accident') {
            for (const top of tree) {
                const children = top.child ?? [];
                children.forEach((child, idx) =>
                    out.push({
                        parent: top,
                        child,
                        idx,
                        spanCount: children.length,
                    }),
                );
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
                        <h2 className="text-base font-semibold text-slate-100">
                            {companyName} · {year} 年度{' '}
                            {kind === 'accident'
                                ? '安全生产事故考核指标评分'
                                : '加分项评分'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            当前合计：{total}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="py-10 text-center">
                            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
                        </div>
                    )}
                    {!loading && error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}
                    {!loading && !error && tree.length === 0 && (
                        <div className="rounded-lg border border-blue-900/40 bg-[#0b1226] p-6 text-center text-sm text-slate-500">
                            {year} 年度暂无评分模板，请联系管理员配置。
                        </div>
                    )}
                    {!loading && !error && tree.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                                    <tr>
                                        {kind === 'accident' && (
                                            <th className="w-40 border-r border-blue-900/30 px-4 py-3">
                                                一级指标
                                            </th>
                                        )}
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">
                                            {kind === 'accident'
                                                ? '二级指标'
                                                : '指标'}
                                        </th>
                                        <th className="w-32 border-r border-blue-900/30 px-4 py-3">
                                            评分依据
                                        </th>
                                        <th className="w-24 border-r border-blue-900/30 px-4 py-3">
                                            分值
                                        </th>
                                        <th className="px-4 py-3">评分意见</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {rows.map(
                                        ({ parent, child, idx, spanCount }) => (
                                            <tr
                                                key={`${parent.id}-${child.id}`}
                                            >
                                                {kind === 'accident' &&
                                                    idx === 0 && (
                                                        <td
                                                            rowSpan={spanCount}
                                                            className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100"
                                                        >
                                                            {parent.title}
                                                        </td>
                                                    )}
                                                <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">
                                                    {child.title}
                                                </td>
                                                <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">
                                                    {child.score_range ?? '—'}
                                                </td>
                                                <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.5}
                                                        value={
                                                            scores[child.id]
                                                                ?.number ?? 0
                                                        }
                                                        onChange={(e) =>
                                                            update(
                                                                child.id,
                                                                'number',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-24 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-sm text-slate-200 outline-none focus:border-blue-500/60"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <textarea
                                                        value={
                                                            scores[child.id]
                                                                ?.comment ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            update(
                                                                child.id,
                                                                'comment',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="评分意见"
                                                        className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500/60"
                                                        rows={2}
                                                    />
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || loading || tree.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-40"
                    >
                        {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        保存评分
                    </button>
                </div>
            </div>
        </div>
    );
}
