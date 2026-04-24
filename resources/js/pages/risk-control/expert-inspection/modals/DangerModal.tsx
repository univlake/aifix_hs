import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import { AnnexUploadEditor } from '@/components/shared/HiddenDangerActionModals';
import type { DangerAnnexItem } from '@/components/shared/HiddenDangerActionModals';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';
import { Field, Modal, ModalHeader, selectCls } from '../components';
import {
    HIDDEN_LEVEL_OPTIONS,
    HIDDEN_TYPE_OPTIONS,
    emptyDanger,
    inputCls,
} from '../types';
import type { DangerForm, ExpertCompanyRow } from '../types';

export function DangerModal({
    open,
    onClose,
    expertCompany,
    inspectionId,
    onSaved,
    rootCompanyId,
}: {
    open: boolean;
    onClose: () => void;
    expertCompany: ExpertCompanyRow | null;
    inspectionId: number | null;
    onSaved: () => void;
    rootCompanyId: number;
}) {
    const [form, setForm] = useState<DangerForm>(emptyDanger());
    const [examineAnnex, setExamineAnnex] = useState<DangerAnnexItem[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(emptyDanger());
            setExamineAnnex([]);
            setError('');
        }
    }, [open]);

    const set = (k: keyof DangerForm, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!expertCompany || !inspectionId) {
            return;
        }

        if (
            !form.area ||
            !form.description ||
            !form.hidden_type ||
            !form.hidden_level
        ) {
            setError('请完整填写场所、描述、类别、等级');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/hidden-danger-infos', {
                expert_inspection_id: inspectionId,
                expert_company_id: expertCompany.id,
                check_company_id: expertCompany.check_company_id,
                area: form.area,
                session: form.session || '第一轮',
                description: form.description,
                hidden_type: form.hidden_type,
                hidden_level: form.hidden_level,
                legalises: form.legalises || null,
                proposal: form.proposal || null,
                correct_deadline: form.correct_deadline || null,
                company_id: rootCompanyId,
                hiddenExamineAnnex: examineAnnex.filter((a) => a.annex_url),
            });
            onSaved();
        } catch (err: unknown) {
            setError(getErrorMessage(err, '操作失败'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <ModalHeader
                title="新增隐患记录"
                subtitle="针对该受检企业登记现场隐患"
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
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="场所" required>
                            <input
                                className={inputCls}
                                value={form.area}
                                onChange={(e) => set('area', e.target.value)}
                            />
                        </Field>
                        <Field label="次数">
                            <input
                                className={inputCls}
                                value={form.session}
                                onChange={(e) => set('session', e.target.value)}
                            />
                        </Field>
                        <Field label="隐患类别" required>
                            <select
                                className={selectCls}
                                value={form.hidden_type}
                                onChange={(e) =>
                                    set('hidden_type', e.target.value)
                                }
                            >
                                <option value="" className="bg-[#0d1530]">
                                    请选择
                                </option>
                                {HIDDEN_TYPE_OPTIONS.map((t) => (
                                    <option
                                        key={t}
                                        value={t}
                                        className="bg-[#0d1530]"
                                    >
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="隐患等级" required>
                            <select
                                className={selectCls}
                                value={form.hidden_level}
                                onChange={(e) =>
                                    set('hidden_level', e.target.value)
                                }
                            >
                                <option value="" className="bg-[#0d1530]">
                                    请选择
                                </option>
                                {HIDDEN_LEVEL_OPTIONS.map((l) => (
                                    <option
                                        key={l}
                                        value={l}
                                        className="bg-[#0d1530]"
                                    >
                                        {l}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="整改截止期限">
                            <DatePicker
                                value={form.correct_deadline}
                                onChange={(v) => set('correct_deadline', v)}
                            />
                        </Field>
                    </div>
                    <Field label="隐患描述" required>
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={3}
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                        />
                    </Field>
                    <Field label="排查依据">
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={2}
                            value={form.legalises}
                            onChange={(e) => set('legalises', e.target.value)}
                        />
                    </Field>
                    <Field label="整改建议">
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={2}
                            value={form.proposal}
                            onChange={(e) => set('proposal', e.target.value)}
                        />
                    </Field>
                    <AnnexUploadEditor
                        value={examineAnnex}
                        onChange={setExamineAnnex}
                        label="隐患排查附件"
                        dir="hidden-danger/examine/"
                    />
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
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {submitting && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    保存隐患
                </button>
            </div>
        </Modal>
    );
}
