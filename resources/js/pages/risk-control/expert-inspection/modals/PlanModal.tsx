import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import { useApiCrud } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import { Field, Modal, ModalHeader } from '../components';
import { emptyPlan, inputCls, planFromRow } from '../types';
import type { Inspection, PlanForm } from '../types';

export function PlanModal({
    open,
    editing,
    onClose,
    onSaved,
    companyId,
}: {
    open: boolean;
    editing: Inspection | null;
    onClose: () => void;
    onSaved: () => void;
    companyId: number;
}) {
    const crud = useApiCrud('/expert-inspections');
    const [form, setForm] = useState<PlanForm>(emptyPlan());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(editing ? planFromRow(editing) : emptyPlan());
            setError('');
        }
    }, [open, editing]);

    const set = (k: keyof PlanForm, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.title.trim()) {
            setError('请输入检查主题');

            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: Record<string, unknown> = {
                title: form.title,
                description: form.description || null,
                comment: form.comment || null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
            };

            if (!editing) {
                payload.company_id = companyId;
            }

            if (editing) {
                await crud.update(editing.id, payload);
            } else {
                await crud.create(payload);
            }

            onSaved();
        } catch (err: unknown) {
            setError(getErrorMessage(err, '操作失败，请重试'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title={editing ? '编辑专家检查计划' : '新增专家检查计划'}
                subtitle="集团端专家现场检查任务管理"
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}
                    <Field label="检查主题" required>
                        <input
                            className={inputCls}
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="例如：Q2 专家安全检查"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="开始日期">
                            <DatePicker
                                value={form.start_date}
                                onChange={(v) => set('start_date', v)}
                            />
                        </Field>
                        <Field label="结束日期">
                            <DatePicker
                                value={form.end_date}
                                onChange={(v) => set('end_date', v)}
                            />
                        </Field>
                    </div>
                    <Field label="检查内容介绍">
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={3}
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            placeholder="本次检查的内容、目标等"
                        />
                    </Field>
                    <Field label="备注">
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={2}
                            value={form.comment}
                            onChange={(e) => set('comment', e.target.value)}
                        />
                    </Field>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={submit}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {loading ? '保存中...' : '保存'}
                </button>
            </div>
        </Modal>
    );
}
