import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Plus,
    Wrench,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export interface DangerAnnexItem {
    id?: number;
    annex_url: string;
    geolocation?: string | null;
}

export interface DangerForAction {
    id: number;
    description?: string | null;
    /** 整改日期（复用 correct_date） */
    correct_date?: string | null;
    /** 整改描述（复用 review_description） */
    review_description?: string | null;
    hidden_rectify_annex?: DangerAnnexItem[];
    hiddenRectifyAnnex?: DangerAnnexItem[];
    hidden_review_annex?: DangerAnnexItem[];
    hiddenReviewAnnex?: DangerAnnexItem[];
}

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function pickRectifyAnnex(d: DangerForAction): DangerAnnexItem[] {
    return d.hidden_rectify_annex ?? d.hiddenRectifyAnnex ?? [];
}
function pickReviewAnnex(d: DangerForAction): DangerAnnexItem[] {
    return d.hidden_review_annex ?? d.hiddenReviewAnnex ?? [];
}

function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

function ModalHeader({
    title,
    subtitle,
    onClose,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-100">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

export function AnnexUploadEditor({
    value,
    onChange,
    label,
    dir,
}: {
    value: DangerAnnexItem[];
    onChange: (v: DangerAnnexItem[]) => void;
    label: string;
    dir?: string;
}) {
    const add = () => onChange([...value, { annex_url: '', geolocation: '' }]);
    const update = (i: number, k: keyof DangerAnnexItem, v: string) => {
        onChange(
            value.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
        );
    };
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {label}
                </label>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/10 px-2 py-0.5 text-[10px] text-blue-400 hover:bg-blue-600/20"
                >
                    <Plus className="h-2.5 w-2.5" />
                    添加附件
                </button>
            </div>
            {value.length === 0 ? (
                <p className="rounded-md border border-dashed border-blue-900/30 py-3 text-center text-[11px] text-slate-600">
                    暂无附件
                </p>
            ) : (
                <div className="space-y-2">
                    {value.map((item, i) => (
                        <div
                            key={i}
                            className="rounded-md border border-blue-900/30 bg-[#070d1f] p-2.5"
                        >
                            <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                    <OssUploadField
                                        value={item.annex_url}
                                        onChange={(url) =>
                                            update(i, 'annex_url', url)
                                        }
                                        dir={dir}
                                    />
                                    <input
                                        className={cn(inputCls, 'text-xs')}
                                        placeholder="位置（可选）"
                                        value={item.geolocation ?? ''}
                                        onChange={(e) =>
                                            update(
                                                i,
                                                'geolocation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RectifyModal({
    open,
    danger,
    onClose,
    onSaved,
}: {
    open: boolean;
    danger: DangerForAction | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState('');
    const [annexes, setAnnexes] = useState<DangerAnnexItem[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setDesc(danger?.review_description ?? '');
            setDate(danger?.correct_date ?? '');
            setAnnexes(danger ? pickRectifyAnnex(danger) : []);
            setError('');
        }
    }, [open, danger]);

    const submit = async () => {
        if (!danger) {
            return;
        }

        if (!desc.trim()) {
            setError('请填写整改描述');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post(`/hidden-danger-infos/${danger.id}/rectify`, {
                review_description: desc,
                correct_date: date || null,
                hiddenRectifyAnnex: annexes.filter((a) => a.annex_url),
            });
            onSaved();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title="隐患整改"
                subtitle="提交整改内容与附件，系统将自动记录整改人"
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
                    {danger?.description && (
                        <div className="rounded-lg border border-blue-900/30 bg-[#070d1f] p-3 text-xs text-slate-400">
                            <p className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                原始隐患描述
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-slate-300">
                                {danger.description}
                            </p>
                        </div>
                    )}
                    <Field label="整改日期">
                        <DatePicker value={date} onChange={setDate} />
                    </Field>
                    <Field label="整改描述" required>
                        <textarea
                            className={cn(inputCls, 'resize-none')}
                            rows={4}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="描述整改过程、措施和结果"
                        />
                    </Field>
                    <AnnexUploadEditor
                        value={annexes}
                        onChange={setAnnexes}
                        label="整改附件"
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
                    {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Wrench className="h-3.5 w-3.5" />
                    )}
                    提交整改
                </button>
            </div>
        </Modal>
    );
}

export function ConfirmRectificationModal({
    open,
    danger,
    onClose,
    onSaved,
}: {
    open: boolean;
    danger: DangerForAction | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [annexes, setAnnexes] = useState<DangerAnnexItem[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setAnnexes(danger ? pickReviewAnnex(danger) : []);
            setError('');
        }
    }, [open, danger]);

    const submit = async () => {
        if (!danger) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post(
                `/hidden-danger-infos/${danger.id}/confirm-rectification`,
                {
                    hiddenReviewAnnex: annexes.filter((a) => a.annex_url),
                },
            );
            onSaved();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };

            setError(e?.response?.data?.message ?? '操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title="整改确认"
                subtitle="确认整改合格，系统将自动记录确认人与确认时间"
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
                    {danger && (
                        <div className="rounded-lg border border-blue-900/30 bg-[#070d1f] p-3 text-xs text-slate-400">
                            <p className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                原整改内容
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-slate-300">
                                {danger.review_description ?? '未提交整改内容'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-600">
                                整改日期：{danger.correct_date ?? '—'}
                            </p>
                        </div>
                    )}
                    <AnnexUploadEditor
                        value={annexes}
                        onChange={setAnnexes}
                        label="复查附件（可选）"
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
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    确认合格
                </button>
            </div>
        </Modal>
    );
}
