import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { cn } from '@/lib/utils';
import { inputCls, yearOptions } from '../types';

export function StartScoringModal({
    title,
    onClose,
    onStart,
}: {
    title: string;
    onClose: () => void;
    onStart: (year: number, companyId: number, companyName: string) => void;
}) {
    const { subordinates } = useScope();
    const [year, setYear] = useState(new Date().getFullYear());
    const [companyId, setCompanyId] = useState<number | null>(null);

    const picked = useMemo(
        () => subordinates.find((s) => s.id === companyId),
        [subordinates, companyId],
    );

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
                    <h3 className="text-sm font-semibold text-slate-100">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="space-y-3">
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">考核年度</span>
                        <select
                            className={cn(inputCls, 'w-full')}
                            value={String(year)}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {yearOptions().map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs text-slate-400">
                        <span className="mb-1 block">下级企业</span>
                        <select
                            className={cn(inputCls, 'w-full')}
                            value={companyId ? String(companyId) : ''}
                            onChange={(e) =>
                                setCompanyId(Number(e.target.value))
                            }
                        >
                            <option value="">选择企业</option>
                            {subordinates.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                    {s.title}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <footer className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-blue-900/40 px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-900/20"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        disabled={!picked}
                        onClick={() =>
                            picked && onStart(year, picked.id, picked.title)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                        开始考核
                    </button>
                </footer>
            </div>
        </div>
    );
}
