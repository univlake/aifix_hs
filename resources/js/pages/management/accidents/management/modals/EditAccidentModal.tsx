import { AlertTriangle, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';
import { Modal } from '../components';
import {
    DEGREE_INJURY_OPTIONS,
    DIRECT_CAUSE_OPTIONS,
    INDIRECT_CAUSE_OPTIONS,
    KID_FIELDS,
    KID_HEADERS,
    LEVEL_OPTIONS,
    TYPE_OPTIONS,
    toEditForm,
    type AccidentFull,
    type EditForm,
    type KidRow,
} from '../types';

const FIELD_SPEC: [keyof EditForm, string, string, boolean][] = [
    ['type', '事故类型', 'select', false],
    ['accident_level', '事故等级', 'select', false],
    ['happen_time', '发生时间', 'date', false],
    ['department', '发生部门', 'text', false],
    ['happen_area', '发生地点', 'text', true],
    ['degree_injury', '伤亡程度', 'select', false],
    ['direct_cause', '直接原因', 'select', false],
    ['indirect_cause', '间接原因', 'select', true],
    ['staff_die', '员工死亡人数', 'number', false],
    ['staff_hurt', '员工受伤人数', 'number', false],
    ['not_staff_die', '非员工死亡人数', 'number', false],
    ['not_staff_hurt', '非员工受伤人数', 'number', false],
    ['direct_loss_property', '直接经济损失 (万元)', 'text', false],
    ['gauge_loss_property', '间接经济损失 (万元)', 'text', false],
];

const blankKid: KidRow = {
    name: '',
    sex: '',
    age: '',
    department: '',
    work_type: '',
    work_age: '',
    education_level: '',
    degree_injury: '',
    days_off: '',
};

export function EditAccidentModal({
    id,
    open,
    onClose,
    onSaved,
}: {
    id: number;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<EditForm | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLoading(true);
        setError('');
        api.get<ApiResponse<AccidentFull>>(`/accident-bulletins/${id}`)
            .then((res) => setForm(toEditForm(res.data.data)))
            .catch(() => setError('加载失败'))
            .finally(() => setLoading(false));
    }, [id, open]);

    const setField = (key: keyof EditForm, value: unknown) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const setKid = (idx: number, key: keyof KidRow, value: string) => {
        setForm((prev) => {
            if (!prev) {
                return prev;
            }

            const kids = prev.kids.map((k, i) =>
                i === idx ? { ...k, [key]: value } : k,
            );

            return { ...prev, kids };
        });
    };

    const addKid = () => {
        setForm((prev) =>
            prev ? { ...prev, kids: [...prev.kids, { ...blankKid }] } : prev,
        );
    };

    const removeKid = (idx: number) => {
        setForm((prev) =>
            prev
                ? { ...prev, kids: prev.kids.filter((_, i) => i !== idx) }
                : prev,
        );
    };

    const handleSave = async () => {
        if (!form) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            await api.put(`/accident-bulletins/${id}`, form);
            onSaved();
            onClose();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setError(err?.response?.data?.message ?? '保存失败');
        } finally {
            setSaving(false);
        }
    };

    const selectOptionsFor = (key: keyof EditForm) =>
        key === 'type'
            ? TYPE_OPTIONS
            : key === 'accident_level'
              ? LEVEL_OPTIONS
              : key === 'degree_injury'
                ? DEGREE_INJURY_OPTIONS
                : key === 'direct_cause'
                  ? DIRECT_CAUSE_OPTIONS
                  : INDIRECT_CAUSE_OPTIONS;

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-100">
                        编辑事故记录
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-600">
                        修改现有记录信息
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 p-6">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    )}

                    {!loading && form && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {FIELD_SPEC.map(([key, label, type, colSpan]) => {
                                const inputClass =
                                    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

                                return (
                                    <div
                                        key={key}
                                        className={
                                            colSpan ? 'md:col-span-2' : ''
                                        }
                                    >
                                        <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            {label}
                                        </label>
                                        {type === 'select' ? (
                                            <select
                                                value={String(form[key] ?? '')}
                                                onChange={(e) =>
                                                    setField(
                                                        key,
                                                        e.target.value || null,
                                                    )
                                                }
                                                className={cn(
                                                    inputClass,
                                                    'cursor-pointer appearance-none',
                                                )}
                                            >
                                                <option
                                                    value=""
                                                    disabled
                                                    className="bg-[#0d1530]"
                                                >
                                                    请选择
                                                </option>
                                                {selectOptionsFor(key).map(
                                                    (option) => (
                                                        <option
                                                            key={option}
                                                            value={option}
                                                            className="bg-[#0d1530]"
                                                        >
                                                            {option}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        ) : (
                                            <input
                                                type={type}
                                                value={
                                                    (form[key] as
                                                        | string
                                                        | number) ?? ''
                                                }
                                                onChange={(e) =>
                                                    setField(
                                                        key,
                                                        e.target.value,
                                                    )
                                                }
                                                className={cn(
                                                    inputClass,
                                                    type === 'date'
                                                        ? 'cursor-pointer'
                                                        : '',
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    事故经过
                                </label>
                                <textarea
                                    value={form.content ?? ''}
                                    onChange={(e) =>
                                        setField('content', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 transition-colors outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    事故报告附件
                                </label>
                                <OssUploadField
                                    value={form.accident_report_url ?? ''}
                                    onChange={(url) =>
                                        setField('accident_report_url', url)
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    现场照片
                                </label>
                                <OssUploadField
                                    value={form.accident_photo_url ?? ''}
                                    onChange={(url) =>
                                        setField('accident_photo_url', url)
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    伤亡人员明细
                                </label>
                                <div className="overflow-x-auto rounded-lg border border-blue-900/30">
                                    {form.kids.length > 0 && (
                                        <table className="w-full min-w-max text-xs">
                                            <thead>
                                                <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                                                    {KID_HEADERS.map(
                                                        (header) => (
                                                            <th
                                                                key={header}
                                                                className="px-3 py-2 text-left font-medium tracking-wide text-slate-500 uppercase"
                                                            >
                                                                {header}
                                                            </th>
                                                        ),
                                                    )}
                                                    <th className="w-8 px-2 py-2" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.kids.map((kid, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="border-b border-blue-900/20 last:border-0"
                                                    >
                                                        {KID_FIELDS.map(
                                                            (field) => (
                                                                <td
                                                                    key={field}
                                                                    className="px-2 py-1.5"
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        value={String(
                                                                            kid[
                                                                                field as keyof KidRow
                                                                            ] ??
                                                                                '',
                                                                        )}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setKid(
                                                                                idx,
                                                                                field as keyof KidRow,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="w-full rounded border border-blue-900/30 bg-transparent px-2 py-1 text-slate-200 placeholder-slate-700 outline-none focus:border-blue-500/60"
                                                                    />
                                                                </td>
                                                            ),
                                                        )}
                                                        <td className="px-2 py-1.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeKid(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="text-slate-600 hover:text-red-400"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addKid}
                                        className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                                    >
                                        <Plus className="h-3 w-3" />
                                        添加成员
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
                >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? '保存中...' : '保存'}
                </button>
            </div>
        </Modal>
    );
}
