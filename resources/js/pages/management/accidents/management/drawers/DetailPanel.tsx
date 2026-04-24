import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import {
    FIELD_LABELS,
    KID_FIELDS,
    KID_HEADERS,
    type AccidentFull,
    type KidRow,
} from '../types';

export function DetailPanel({
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
            <div className="flex-1 bg-black/50" onClick={onClose} />

            <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-100">
                        事故详情
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

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
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {(
                                    Object.keys(
                                        FIELD_LABELS,
                                    ) as (keyof typeof FIELD_LABELS)[]
                                )
                                    .filter(
                                        (k) =>
                                            k !== 'content' &&
                                            k !== 'accident_report_url' &&
                                            k !== 'accident_photo_url',
                                    )
                                    .map((key) => {
                                        const val =
                                            detail[key as keyof AccidentFull];
                                        const display =
                                            val !== null &&
                                            val !== undefined &&
                                            val !== ''
                                                ? String(val)
                                                : '—';

                                        return (
                                            <div key={key}>
                                                <p className="text-xs text-slate-600">
                                                    {FIELD_LABELS[key]}
                                                </p>
                                                <p className="mt-0.5 text-sm text-slate-300">
                                                    {display}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>

                            {detail.content && (
                                <div>
                                    <p className="text-xs text-slate-600">
                                        {FIELD_LABELS.content}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                        {detail.content}
                                    </p>
                                </div>
                            )}

                            {(detail.accident_report_url ||
                                detail.accident_photo_url) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {detail.accident_report_url && (
                                        <div>
                                            <p className="text-xs text-slate-600">
                                                {
                                                    FIELD_LABELS.accident_report_url
                                                }
                                            </p>
                                            <AttachmentViewer
                                                url={
                                                    detail.accident_report_url
                                                }
                                                label="查看附件"
                                                className="mt-1 inline-block text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
                                            />
                                        </div>
                                    )}
                                    {detail.accident_photo_url && (
                                        <div>
                                            <p className="text-xs text-slate-600">
                                                {
                                                    FIELD_LABELS.accident_photo_url
                                                }
                                            </p>
                                            <AttachmentViewer
                                                url={detail.accident_photo_url}
                                                label="查看照片"
                                                className="mt-1 inline-block text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {detail.kids.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium text-slate-500">
                                        伤亡人员明细
                                    </p>
                                    <div className="overflow-x-auto rounded-lg border border-blue-900/30">
                                        <table className="w-full min-w-max text-xs">
                                            <thead>
                                                <tr className="border-b border-blue-900/30 bg-[#0a1020]">
                                                    {KID_HEADERS.map((h) => (
                                                        <th
                                                            key={h}
                                                            className="px-3 py-2 text-left font-medium text-slate-500"
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detail.kids.map((k, i) => (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-blue-900/20 last:border-0"
                                                    >
                                                        {KID_FIELDS.map((f) => (
                                                            <td
                                                                key={f}
                                                                className="px-3 py-2 text-slate-400"
                                                            >
                                                                {k[
                                                                    f as keyof KidRow
                                                                ] ?? '—'}
                                                            </td>
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
