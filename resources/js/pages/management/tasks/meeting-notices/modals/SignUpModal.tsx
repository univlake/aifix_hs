import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { Field } from '../components';
import { inputCls } from '../types';
import type { Meeting } from '../types';

interface SignUpModalProps {
    meeting: Meeting;
    companyId: number;
    companyName: string | null;
    onClose: () => void;
    onSaved: () => void;
}

export function SignUpModal({
    meeting,
    companyId,
    companyName,
    onClose,
    onSaved,
}: SignUpModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        sex: '',
        job_title: '',
        tel: '',
        card_number: '',
        is_driving: '',
    });

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入姓名');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post('/meeting-sign-ups', {
                meeting_id: meeting.id,
                company_id: companyId,
                company_name: companyName,
                name: form.name.trim(),
                sex: form.sex || null,
                job_title: form.job_title.trim() || null,
                tel: form.tel.trim() || null,
                card_number: form.card_number.trim() || null,
                is_driving: form.is_driving || null,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '报名失败';
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
                className="w-full max-w-lg rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                            会议报名
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

                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="姓名" required>
                        <input
                            className={inputCls}
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                        />
                    </Field>
                    <Field label="性别">
                        <select
                            className={inputCls}
                            value={form.sex}
                            onChange={(e) => update('sex', e.target.value)}
                        >
                            <option value="">请选择</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                        </select>
                    </Field>
                    <Field label="职务">
                        <input
                            className={inputCls}
                            value={form.job_title}
                            onChange={(e) =>
                                update('job_title', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="电话">
                        <input
                            className={inputCls}
                            value={form.tel}
                            onChange={(e) => update('tel', e.target.value)}
                        />
                    </Field>
                    <Field label="证件号">
                        <input
                            className={inputCls}
                            value={form.card_number}
                            onChange={(e) =>
                                update('card_number', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="是否自驾">
                        <select
                            className={inputCls}
                            value={form.is_driving}
                            onChange={(e) =>
                                update('is_driving', e.target.value)
                            }
                        >
                            <option value="">请选择</option>
                            <option value="是">是</option>
                            <option value="否">否</option>
                        </select>
                    </Field>
                </div>

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
                        disabled={saving || !form.name.trim()}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        提交报名
                    </button>
                </footer>
            </div>
        </div>
    );
}
