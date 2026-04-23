import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ApiResponse, PaginatedData } from '@/types/models';
import type { Meeting, MeetingSignUpRow } from '../types';

interface OwnSignUpsModalProps {
    meeting: Meeting;
    companyId: number;
    onClose: () => void;
}

export function OwnSignUpsModal({
    meeting,
    companyId,
    onClose,
}: OwnSignUpsModalProps) {
    const [rows, setRows] = useState<MeetingSignUpRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        api.get<ApiResponse<PaginatedData<MeetingSignUpRow>>>(
            '/meeting-sign-ups',
            {
                params: {
                    meeting_id: meeting.id,
                    company_id: companyId,
                    per_page: 100,
                },
            },
        )
            .then((res) => {
                if (!ignore) {
                    setRows(res.data.data.data);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setRows([]);
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
    }, [meeting.id, companyId]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            本企业报名名单
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {meeting.name ?? ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading ? (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] p-6 text-center text-sm text-slate-500">
                        尚未报名
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f]">
                        <table className="min-w-full text-xs">
                            <thead className="bg-blue-950/40 text-left text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">姓名</th>
                                    <th className="px-3 py-2">性别</th>
                                    <th className="px-3 py-2">职务</th>
                                    <th className="px-3 py-2">电话</th>
                                    <th className="px-3 py-2">证件号</th>
                                    <th className="px-3 py-2">自驾</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/30">
                                {rows.map((s) => (
                                    <tr key={s.id} className="text-slate-300">
                                        <td className="px-3 py-2">
                                            {s.name ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.sex ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.job_title ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.tel ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.card_number ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.is_driving ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <footer className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>共 {rows.length} 人</span>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-slate-300 hover:bg-blue-900/20"
                    >
                        关闭
                    </button>
                </footer>
            </div>
        </div>
    );
}
