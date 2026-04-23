import { Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import {
    CONFIG,
    type NoticeRow,
    type NoticeScopeRow,
    type NoticeVariant,
} from '../types';

interface AddCompanyModalProps {
    variant: NoticeVariant;
    notice: NoticeRow;
    existing: NoticeScopeRow[];
    onClose: () => void;
    onSaved: () => void;
}

export function AddCompanyModal({
    variant,
    notice,
    existing,
    onClose,
    onSaved,
}: AddCompanyModalProps) {
    const config = CONFIG[variant];
    const { subordinates } = useScope();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const existingIds = useMemo(
        () => new Set(existing.map((s) => s.company_id)),
        [existing],
    );
    const available = useMemo(
        () => subordinates.filter((c) => !existingIds.has(c.id)),
        [subordinates, existingIds],
    );

    const toggle = (id: number) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);

            if (n.has(id)) {
                n.delete(id);
            } else {
                n.add(id);
            }

            return n;
        });
    };

    const save = async () => {
        if (selectedIds.size === 0) {
            return;
        }

        setSaving(true);

        try {
            const kids = [
                ...existing.map((s) => ({
                    company_id: s.company_id,
                    company_name: s.company_name,
                    company_group_id: s.company_group_id,
                    company_group_name: s.company_group_name,
                })),
                ...subordinates
                    .filter((c) => selectedIds.has(c.id))
                    .map((c) => ({ company_id: c.id, company_name: c.title })),
            ];
            await api.put(`${config.endpoint}/${notice.id}`, { kids });
            onSaved();
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
                <header className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">
                        添加通知企业
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>
                {available.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                        所有下属企业已添加
                    </p>
                ) : (
                    <ul className="max-h-80 space-y-1 overflow-y-auto">
                        {available.map((c) => (
                            <li key={c.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-900/30 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 hover:border-blue-500/40">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(c.id)}
                                        onChange={() => toggle(c.id)}
                                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500"
                                    />
                                    {c.title}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        onClick={save}
                        disabled={selectedIds.size === 0 || saving}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        保存 ({selectedIds.size})
                    </button>
                </footer>
            </div>
        </div>
    );
}
