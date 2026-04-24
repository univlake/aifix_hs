import { ChevronDown, ChevronRight, Loader2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { OssUploadField } from '@/components/shared/OssUploadField';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types/models';
import { Field } from '../components';
import { inputCls } from '../types';
import type { CreateMeetingPayload, EnterpriseGroup } from '../types';

interface CreateMeetingModalProps {
    companyId: number;
    onClose: () => void;
    onSaved: () => void;
}

interface GroupSelectionEntry {
    company_id: number;
    company_name: string;
    company_group_id: number;
    company_group_name: string;
}

export function CreateMeetingModal({
    companyId,
    onClose,
    onSaved,
}: CreateMeetingModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        theme: '',
        place: '',
        alert_others: '',
        meeting_date: '',
        sign_up_date: '',
        sign_end_date: '',
        summary: '',
        summary_annex_url: '',
        sign_annex_url: '',
        material_annex_url: '',
        photo_annex_url: '',
    });

    const [groups, setGroups] = useState<EnterpriseGroup[]>([]);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        new Set(),
    );
    /** Keyed by `${groupId}:${companyId}` — a company can appear in multiple groups. */
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        setGroupsLoading(true);
        api.get<ApiResponse<EnterpriseGroup[]>>('/company-groups', {
            params: { company_id: companyId },
        })
            .then((res) => {
                const list = res.data.data ?? [];
                setGroups(list);
                setExpandedGroups(new Set(list.map((g) => g.id)));
            })
            .catch(() => setGroups([]))
            .finally(() => setGroupsLoading(false));
    }, [companyId]);

    const update = <K extends keyof typeof form>(key: K, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const entryKey = (groupId: number, cid: number) => `${groupId}:${cid}`;

    const toggleCompany = (groupId: number, cid: number) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const k = entryKey(groupId, cid);

            if (n.has(k)) {
                n.delete(k);
            } else {
                n.add(k);
            }

            return n;
        });
    };

    const toggleGroup = (g: EnterpriseGroup) => {
        setSelectedKeys((prev) => {
            const n = new Set(prev);
            const allSelected = g.kid_companies.every((c) =>
                n.has(entryKey(g.id, c.id)),
            );

            if (allSelected) {
                g.kid_companies.forEach((c) => n.delete(entryKey(g.id, c.id)));
            } else {
                g.kid_companies.forEach((c) => n.add(entryKey(g.id, c.id)));
            }

            return n;
        });
    };

    const toggleExpand = (groupId: number) => {
        setExpandedGroups((prev) => {
            const n = new Set(prev);

            if (n.has(groupId)) {
                n.delete(groupId);
            } else {
                n.add(groupId);
            }

            return n;
        });
    };

    const clearAll = () => setSelectedKeys(new Set());

    const selectedEntries = useMemo<GroupSelectionEntry[]>(() => {
        const rows: GroupSelectionEntry[] = [];

        for (const g of groups) {
            for (const c of g.kid_companies) {
                if (selectedKeys.has(entryKey(g.id, c.id))) {
                    rows.push({
                        company_id: c.id,
                        company_name: c.title,
                        company_group_id: g.id,
                        company_group_name: g.name,
                    });
                }
            }
        }

        return rows;
    }, [groups, selectedKeys]);

    const save = async () => {
        if (!form.name.trim()) {
            setError('请输入会议名称');

            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload: CreateMeetingPayload = {
                company_id: companyId,
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
                kids: selectedEntries,
            };
            await api.post('/meetings', payload);
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
                        新建会议通知
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="会议名称" required>
                            <input
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="请输入会议名称"
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
                            onChange={(e) => update('summary', e.target.value)}
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

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs text-slate-400">
                                从企业组选择通知对象（已选{' '}
                                {selectedEntries.length}）
                            </label>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                清空
                            </button>
                        </div>
                        {groupsLoading ? (
                            <div className="rounded-lg border border-blue-900/40 bg-[#070d1f] py-6 text-center text-slate-500">
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                            </div>
                        ) : groups.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-blue-900/40 bg-[#070d1f] py-4 text-center text-xs text-slate-500">
                                尚未创建企业组，请先在「企业分组」中维护。
                            </p>
                        ) : (
                            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f] p-2">
                                {groups.map((g) => {
                                    const expanded = expandedGroups.has(g.id);
                                    const selectedInGroup =
                                        g.kid_companies.filter((c) =>
                                            selectedKeys.has(
                                                entryKey(g.id, c.id),
                                            ),
                                        ).length;
                                    const total = g.kid_companies.length;
                                    const allSelected =
                                        total > 0 && selectedInGroup === total;
                                    const partial =
                                        selectedInGroup > 0 &&
                                        selectedInGroup < total;

                                    return (
                                        <li
                                            key={g.id}
                                            className="rounded-md border border-blue-900/30 bg-[#050b1a]"
                                        >
                                            <div className="flex items-center gap-2 px-2 py-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleExpand(g.id)
                                                    }
                                                    className="text-slate-500 hover:text-slate-200"
                                                >
                                                    {expanded ? (
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.indeterminate =
                                                                    partial;
                                                            }
                                                        }}
                                                        onChange={() =>
                                                            toggleGroup(g)
                                                        }
                                                        disabled={total === 0}
                                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                    />
                                                    <Users className="h-3.5 w-3.5 text-blue-400" />
                                                    <span className="font-medium">
                                                        {g.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({selectedInGroup}/
                                                        {total})
                                                    </span>
                                                </label>
                                            </div>
                                            {expanded && total > 0 && (
                                                <ul className="space-y-1 border-t border-blue-900/30 px-2 py-1.5 pl-8">
                                                    {g.kid_companies.map(
                                                        (c) => (
                                                            <li key={c.id}>
                                                                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-300 hover:bg-blue-900/20">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedKeys.has(
                                                                            entryKey(
                                                                                g.id,
                                                                                c.id,
                                                                            ),
                                                                        )}
                                                                        onChange={() =>
                                                                            toggleCompany(
                                                                                g.id,
                                                                                c.id,
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                                                    />
                                                                    {c.title}
                                                                </label>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                            {expanded && total === 0 && (
                                                <p className="border-t border-blue-900/30 px-2 py-2 pl-8 text-xs text-slate-500">
                                                    该组暂无企业
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
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
                        保存
                    </button>
                </footer>
            </div>
        </div>
    );
}
