import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';
import { Field } from '../components';
import { inputCls, toLocalInput } from '../types';
import type { Meeting } from '../types';

interface EditMeetingModalProps {
    meeting: Meeting;
    onClose: () => void;
    onSaved: () => void;
}

export function EditMeetingModal({
    meeting,
    onClose,
    onSaved,
}: EditMeetingModalProps) {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: meeting.name ?? '',
        theme: meeting.theme ?? '',
        place: meeting.place ?? '',
        alert_others: meeting.alert_others ?? '',
        meeting_date: toLocalInput(meeting.meeting_date),
        sign_up_date: toLocalInput(meeting.sign_up_date),
        sign_end_date: toLocalInput(meeting.sign_end_date),
        summary: meeting.summary ?? '',
        summary_annex_url: meeting.summary_annex_url ?? '',
        sign_annex_url: meeting.sign_annex_url ?? '',
        material_annex_url: meeting.material_annex_url ?? '',
        photo_annex_url: meeting.photo_annex_url ?? '',
    });

    useEffect(() => {
        let ignore = false;
        api.get<ApiResponse<Meeting>>(`/meetings/${meeting.id}`)
            .then((res) => {
                if (ignore) {
                    return;
                }

                const d = res.data.data;
                setForm({
                    name: d.name ?? '',
                    theme: d.theme ?? '',
                    place: d.place ?? '',
                    alert_others: d.alert_others ?? '',
                    meeting_date: toLocalInput(d.meeting_date),
                    sign_up_date: toLocalInput(d.sign_up_date),
                    sign_end_date: toLocalInput(d.sign_end_date),
                    summary: d.summary ?? '',
                    summary_annex_url: d.summary_annex_url ?? '',
                    sign_annex_url: d.sign_annex_url ?? '',
                    material_annex_url: d.material_annex_url ?? '',
                    photo_annex_url: d.photo_annex_url ?? '',
                });
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [meeting.id]);

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入会议名称');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.put(`/meetings/${meeting.id}`, {
                name: form.name.trim(),
                theme: form.theme.trim() || null,
                place: form.place.trim() || null,
                alert_others: form.alert_others.trim() || null,
                meeting_date: form.meeting_date || null,
                sign_up_date: form.sign_up_date || null,
                sign_end_date: form.sign_end_date || null,
                summary: form.summary.trim() || null,
                summary_annex_url: form.summary_annex_url || null,
                sign_annex_url: form.sign_annex_url || null,
                material_annex_url: form.material_annex_url || null,
                photo_annex_url: form.photo_annex_url || null,
            });
            onSaved();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '保存失败';
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
                className="w-full max-w-3xl rounded-xl border border-blue-900/40 bg-[#050915] p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        编辑会议
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {loading ? (
                    <div className="py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                ) : (
                    <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="会议名称" required>
                                <input
                                    className={inputCls}
                                    value={form.name}
                                    onChange={(e) =>
                                        update('name', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议主题">
                                <input
                                    className={inputCls}
                                    value={form.theme}
                                    onChange={(e) =>
                                        update('theme', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议地点">
                                <input
                                    className={inputCls}
                                    value={form.place}
                                    onChange={(e) =>
                                        update('place', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="通知人">
                                <input
                                    className={inputCls}
                                    value={form.alert_others}
                                    onChange={(e) =>
                                        update('alert_others', e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="会议时间">
                                <DateTimePicker
                                    value={form.meeting_date}
                                    onChange={(v) => update('meeting_date', v)}
                                />
                            </Field>
                            <Field label="报名开始">
                                <DateTimePicker
                                    value={form.sign_up_date}
                                    onChange={(v) => update('sign_up_date', v)}
                                />
                            </Field>
                            <Field label="报名截止">
                                <DateTimePicker
                                    value={form.sign_end_date}
                                    onChange={(v) => update('sign_end_date', v)}
                                />
                            </Field>
                        </div>
                        <Field label="会议内容">
                            <textarea
                                className={cn(inputCls, 'min-h-[80px]')}
                                value={form.summary}
                                onChange={(e) =>
                                    update('summary', e.target.value)
                                }
                            />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="会议纪要附件">
                                <OssUploadField
                                    value={form.summary_annex_url}
                                    onChange={(url) =>
                                        update('summary_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="签到附件">
                                <OssUploadField
                                    value={form.sign_annex_url}
                                    onChange={(url) =>
                                        update('sign_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="会议资料附件">
                                <OssUploadField
                                    value={form.material_annex_url}
                                    onChange={(url) =>
                                        update('material_annex_url', url)
                                    }
                                />
                            </Field>
                            <Field label="会议照片附件">
                                <OssUploadField
                                    value={form.photo_annex_url}
                                    onChange={(url) =>
                                        update('photo_annex_url', url)
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                )}

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
                        disabled={saving || loading || !form.name.trim()}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存
                    </button>
                </footer>
            </div>
        </div>
    );
}
