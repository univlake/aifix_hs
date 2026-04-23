import { Loader2 } from 'lucide-react';

export function DeleteAccidentModal({
    loading,
    onCancel,
    onConfirm,
}: {
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-blue-900/40 bg-[#070d1f] p-6 shadow-2xl">
                <h3 className="text-base font-semibold text-slate-100">
                    删除事故记录
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    确认删除这条事故记录吗？删除后将无法恢复。
                </p>
                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        确认删除
                    </button>
                </div>
            </div>
        </div>
    );
}
