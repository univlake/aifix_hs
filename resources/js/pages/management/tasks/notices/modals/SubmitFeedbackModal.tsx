import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { Field } from '../components';
import type { NoticeRow, NoticeScopeRow } from '../types';

interface SubmitFeedbackModalProps {
    scope: NoticeScopeRow;
    notice: NoticeRow;
    onClose: () => void;
    onSaved: () => void;
}

export function SubmitFeedbackModal({
    scope,
    notice,
    onClose,
    onSaved,
}: SubmitFeedbackModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [annexUrl, setAnnexUrl] = useState('');

    const save = async () => {
        if (!annexUrl) {
            setError('请上传反馈附件');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post(`/office-notify-scopes/${scope.id}/feedback`, {
                feedback_annex_url: annexUrl,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '提交失败';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            提交任务反馈
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {notice.name ?? ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <Field label="反馈附件" required>
                    <OssUploadField value={annexUrl} onChange={setAnnexUrl} />
                </Field>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || !annexUrl}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        提交反馈
                    </button>
                </footer>
            </div>
        </div>
    );
}
