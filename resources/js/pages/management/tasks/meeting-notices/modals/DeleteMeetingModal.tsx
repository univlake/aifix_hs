import { Loader2, Trash2 } from 'lucide-react';
import type { Meeting } from '../types';

interface DeleteMeetingModalProps {
    meeting: Meeting;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

export function DeleteMeetingModal({
    meeting,
    loading,
    onCancel,
    onConfirm,
}: DeleteMeetingModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-xl border border-blue-900/40 bg-[#050915] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除会议
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {meeting.name ?? `会议 #${meeting.id}`}
                        </span>
                        &rdquo;
                        吗？此操作不可撤销，将同时清除关联的通知与报名记录。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-40"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => void onConfirm()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </div>
        </div>
    );
}
