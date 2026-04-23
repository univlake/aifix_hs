import { Loader2, Trash2 } from 'lucide-react';
import { Modal } from '../components';

interface DeleteInvestigationModalProps {
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteInvestigationModal({
    open,
    loading,
    onCancel,
    onConfirm,
}: DeleteInvestigationModalProps) {
    return (
        <Modal open={open} onClose={onCancel}>
            <div className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                    <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="mb-1 text-base font-semibold text-slate-100">
                    删除隐患记录
                </h2>
                <p className="text-sm text-slate-500">
                    确定要删除该隐患记录吗？此操作不可撤销。
                </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {loading ? '删除中...' : '确认删除'}
                </button>
            </div>
        </Modal>
    );
}
