import { AlertTriangle, Loader2, X } from 'lucide-react';
import { DatePicker } from '@/components/shared/DatePicker';
import { cn } from '@/lib/utils';
import { AnnexListEditor, Modal } from '../components';
import {
    CORRECT_RESULT_OPTIONS,
    inputCls,
    LEVEL_OPTIONS,
    selectCls,
    TYPE_OPTIONS,
    type FormState,
} from '../types';

interface InvestigationFormModalProps {
    open: boolean;
    editing: boolean;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    formLoading: boolean;
    formError: string;
    onClose: () => void;
    onSubmit: () => void;
}

export function InvestigationFormModal({
    open,
    editing,
    form,
    setForm,
    formLoading,
    formError,
    onClose,
    onSubmit,
}: InvestigationFormModalProps) {
    const set = (k: keyof FormState, v: string) =>
        setForm((f) => ({ ...f, [k]: v }));

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">
                        {editing ? '编辑隐患记录' : '新增隐患记录'}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-600">
                        月度排查隐患信息登记
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {formError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {formError}
                        </div>
                    )}

                    <section>
                        <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            基本信息
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    隐患类型
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        set('type', e.target.value)
                                    }
                                    className={selectCls}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {TYPE_OPTIONS.map((t) => (
                                        <option
                                            key={t}
                                            value={t}
                                            className="bg-[#0d1530]"
                                        >
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    隐患等级
                                </label>
                                <select
                                    value={form.level}
                                    onChange={(e) =>
                                        set('level', e.target.value)
                                    }
                                    className={selectCls}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {LEVEL_OPTIONS.map((l) => (
                                        <option
                                            key={l}
                                            value={l}
                                            className="bg-[#0d1530]"
                                        >
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    排查时间
                                </label>
                                <DatePicker
                                    value={form.inv_time}
                                    onChange={(v) => set('inv_time', v)}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    排查人
                                </label>
                                <input
                                    type="text"
                                    value={form.inv_name}
                                    onChange={(e) =>
                                        set('inv_name', e.target.value)
                                    }
                                    placeholder="排查人姓名"
                                    className={inputCls}
                                />
                            </div>
                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_fire_fighting === '1'}
                                        onChange={(e) =>
                                            set(
                                                'is_fire_fighting',
                                                e.target.checked ? '1' : '0',
                                            )
                                        }
                                        className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                    />
                                    <span className="text-xs text-slate-400">
                                        消防排查
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_emergency === '1'}
                                        onChange={(e) =>
                                            set(
                                                'is_emergency',
                                                e.target.checked ? '1' : '0',
                                            )
                                        }
                                        className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                    />
                                    <span className="text-xs text-slate-400">
                                        应急排查
                                    </span>
                                </label>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    隐患描述
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) =>
                                        set('content', e.target.value)
                                    }
                                    rows={3}
                                    placeholder="详细描述隐患情况"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    法律依据
                                </label>
                                <textarea
                                    value={form.legalbasis}
                                    onChange={(e) =>
                                        set('legalbasis', e.target.value)
                                    }
                                    rows={2}
                                    placeholder="相关法规/标准依据"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    整改建议
                                </label>
                                <textarea
                                    value={form.proposal}
                                    onChange={(e) =>
                                        set('proposal', e.target.value)
                                    }
                                    rows={2}
                                    placeholder="建议整改措施"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            整改与治理
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    整改日期
                                </label>
                                <DatePicker
                                    value={form.correct_date}
                                    onChange={(v) => set('correct_date', v)}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    整改结果
                                </label>
                                <select
                                    value={form.correct_result}
                                    onChange={(e) =>
                                        set('correct_result', e.target.value)
                                    }
                                    className={selectCls}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {CORRECT_RESULT_OPTIONS.map((r) => (
                                        <option
                                            key={r}
                                            value={r}
                                            className="bg-[#0d1530]"
                                        >
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 pt-1">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_govern === '1'}
                                        onChange={(e) =>
                                            set(
                                                'is_govern',
                                                e.target.checked ? '1' : '0',
                                            )
                                        }
                                        className="h-4 w-4 rounded border-blue-900/40 accent-blue-500"
                                    />
                                    <span className="text-xs text-slate-400">
                                        已治理
                                    </span>
                                </label>
                            </div>
                            {form.is_govern === '1' && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理项目
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_title}
                                            onChange={(e) =>
                                                set(
                                                    'govern_title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="治理项目名称"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理责任人
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_user}
                                            onChange={(e) =>
                                                set(
                                                    'govern_user',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="治理负责人"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理日期
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_date}
                                            onChange={(e) =>
                                                set(
                                                    'govern_date',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="治理完成日期"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理费用（万元）
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_money}
                                            onChange={(e) =>
                                                set(
                                                    'govern_money',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="费用金额"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理材料
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_supplies}
                                            onChange={(e) =>
                                                set(
                                                    'govern_supplies',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="使用材料"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            治理内容
                                        </label>
                                        <input
                                            type="text"
                                            value={form.govern_text}
                                            onChange={(e) =>
                                                set(
                                                    'govern_text',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="具体治理内容"
                                            className={inputCls}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <section>
                        <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            复查信息
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    复查人
                                </label>
                                <input
                                    type="text"
                                    value={form.review_user}
                                    onChange={(e) =>
                                        set('review_user', e.target.value)
                                    }
                                    placeholder="复查人姓名"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    复查日期
                                </label>
                                <DatePicker
                                    value={form.review_date}
                                    onChange={(v) => set('review_date', v)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    复查说明
                                </label>
                                <textarea
                                    value={form.review_discription}
                                    onChange={(e) =>
                                        set(
                                            'review_discription',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    placeholder="复查情况说明"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    复查结果描述
                                </label>
                                <textarea
                                    value={form.review_content}
                                    onChange={(e) =>
                                        set('review_content', e.target.value)
                                    }
                                    rows={2}
                                    placeholder="复查详细内容"
                                    className={cn(inputCls, 'resize-none')}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <p className="mb-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                            附件
                        </p>
                        <div className="space-y-4">
                            <AnnexListEditor
                                value={form.monthlyInvestigationViews}
                                onChange={(v) =>
                                    setForm((f) => ({
                                        ...f,
                                        monthlyInvestigationViews: v,
                                    }))
                                }
                                label="隐患证据(图片)"
                            />
                            <AnnexListEditor
                                value={form.monthlyInvestigationReviews}
                                onChange={(v) =>
                                    setForm((f) => ({
                                        ...f,
                                        monthlyInvestigationReviews: v,
                                    }))
                                }
                                label="复查附件"
                            />
                        </div>
                    </section>
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
                    onClick={onSubmit}
                    disabled={formLoading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {formLoading && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {formLoading ? '保存中...' : '保存'}
                </button>
            </div>
        </Modal>
    );
}
