import { CheckCircle2, FileText, Loader2, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import api from '@/lib/api';
import {
    STATUS_SCORED,
    type DailyCheckRow,
    type SubmissionRow,
} from '@/pages/assessment/filing/Index';
import type { ApiResponse } from '@/types/models';
import { fileNameOf, splitPaths, type SubmissionDetail } from '../types';

export function DailyScoringDrawer({
    submission,
    onClose,
    onSaved,
}: {
    submission: SubmissionRow;
    onClose: () => void;
    onSaved: () => void;
}) {
    const readOnly = submission.status === STATUS_SCORED;

    const [detail, setDetail] = useState<SubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<
        Record<number, { number: number; comment: string }>
    >({});

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<SubmissionDetail>>('/daily-checks/submission', {
            params: {
                company_id: submission.company_id,
                year: submission.year,
            },
        })
            .then((res) => {
                if (ignore) {
                    return;
                }

                const d = res.data.data;
                setDetail(d);
                const init: Record<
                    number,
                    { number: number; comment: string }
                > = {};

                for (const top of d.templates ?? []) {
                    for (const child of top.child ?? []) {
                        const c: DailyCheckRow | null | undefined = child.check;
                        init[child.id] = {
                            number: c?.number ?? 0,
                            comment: c?.comment ?? '',
                        };
                    }
                }

                setScores(init);
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [submission.company_id, submission.year]);

    const updateScore = (
        templateId: number,
        field: 'number' | 'comment',
        value: string,
    ) => {
        setScores((prev) => ({
            ...prev,
            [templateId]: {
                ...(prev[templateId] ?? { number: 0, comment: '' }),
                [field]:
                    field === 'number'
                        ? Math.max(0, Math.round((Number(value) || 0) * 2) / 2)
                        : value,
            },
        }));
    };

    const totalScore =
        Math.round(
            Object.values(scores).reduce(
                (s, v) => s + (Number(v.number) || 0),
                0,
            ) * 10,
        ) / 10;

    const submitScore = async () => {
        if (!detail) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const items: {
                daily_check_template_id: number;
                number: number;
                comment: string | null;
            }[] = [];

            for (const top of detail.templates) {
                for (const child of top.child ?? []) {
                    const s = scores[child.id];

                    if (!s) {
                        continue;
                    }

                    items.push({
                        daily_check_template_id: child.id,
                        number: s.number,
                        comment: s.comment || null,
                    });
                }
            }

            await api.post('/daily-checks/score', {
                company_id: submission.company_id,
                year: submission.year,
                items,
            });
            onSaved();
        } catch (e) {
            const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setError(err.response?.data?.message ?? err.message ?? '评分失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {submission.company_name} · {submission.year}{' '}
                            年度考核 {readOnly ? '查看' : '评分'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            当前总分：{totalScore}
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
                    {!loading && !error && detail && (
                        <div className="overflow-hidden rounded-lg border border-blue-900/40">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-950/40 text-left text-xs tracking-wide text-slate-400 uppercase">
                                    <tr>
                                        <th className="w-40 border-r border-blue-900/30 px-4 py-3">
                                            一级指标
                                        </th>
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">
                                            二级指标
                                        </th>
                                        <th className="w-28 border-r border-blue-900/30 px-4 py-3">
                                            评分依据
                                        </th>
                                        <th className="w-56 border-r border-blue-900/30 px-4 py-3">
                                            填报文件
                                        </th>
                                        <th className="w-28 border-r border-blue-900/30 px-4 py-3">
                                            得分
                                        </th>
                                        <th className="px-4 py-3">评分意见</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/30">
                                    {detail.templates.map((top) => {
                                        const children = top.child ?? [];

                                        if (children.length === 0) {
                                            return null;
                                        }

                                        return children.map((child, idx) => {
                                            const paths = splitPaths(
                                                child.check?.path,
                                            );

                                            return (
                                                <tr key={child.id}>
                                                    {idx === 0 && (
                                                        <td
                                                            rowSpan={
                                                                children.length
                                                            }
                                                            className="border-r border-blue-900/30 bg-[#0b1226] px-4 py-3 align-top font-medium text-slate-100"
                                                        >
                                                            {top.title}
                                                        </td>
                                                    )}
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-slate-200">
                                                        {child.title}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top text-xs text-slate-400">
                                                        {child.score_range ??
                                                            '—'}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                        {paths.length === 0 ? (
                                                            <span className="text-xs text-slate-600">
                                                                未上传
                                                            </span>
                                                        ) : (
                                                            <ul className="space-y-1">
                                                                {paths.map(
                                                                    (p, i) => (
                                                                        <li
                                                                            key={`${p}-${i}`}
                                                                            className="flex items-center gap-1.5 text-xs"
                                                                        >
                                                                            <FileText className="h-3 w-3 shrink-0 text-blue-400" />
                                                                            <span className="truncate text-slate-300">
                                                                                {fileNameOf(
                                                                                    p,
                                                                                )}
                                                                            </span>
                                                                            <AttachmentViewer
                                                                                url={
                                                                                    p
                                                                                }
                                                                                filename={fileNameOf(
                                                                                    p,
                                                                                )}
                                                                                label="查看"
                                                                                className="ml-auto shrink-0 text-blue-400 hover:text-blue-300"
                                                                            />
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-blue-900/30 px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step={0.5}
                                                            disabled={readOnly}
                                                            value={
                                                                scores[child.id]
                                                                    ?.number ??
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                updateScore(
                                                                    child.id,
                                                                    'number',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-24 rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-sm text-slate-200 outline-none focus:border-blue-500/60 disabled:opacity-60"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <textarea
                                                            disabled={readOnly}
                                                            value={
                                                                scores[child.id]
                                                                    ?.comment ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                updateScore(
                                                                    child.id,
                                                                    'comment',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="评分意见"
                                                            className="w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500/60 disabled:opacity-60"
                                                            rows={2}
                                                        />
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
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-300 hover:bg-blue-900/20"
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            onClick={submitScore}
                            disabled={saving || loading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-40"
                        >
                            {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            提交评分
                        </button>
                    </div>
                )}
                {readOnly && (
                    <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4 text-xs text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        已完成评分
                    </div>
                )}
            </div>
        </div>
    );
}
