import { ChevronDown, X } from 'lucide-react';
import { OssUploadField } from '@/components/shared/OssUploadField';
import type { AnnexItem } from './types';

export function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs text-slate-600">{label}</p>
            <p className="mt-0.5 text-sm text-slate-300">
                {value !== null && value !== undefined && value !== ''
                    ? String(value)
                    : '—'}
            </p>
        </div>
    );
}

export function Modal({
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
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

export function FilterSelect({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-blue-900/40 bg-[#070d1f] pr-7 pl-3 text-xs text-slate-400 outline-none"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-600" />
        </div>
    );
}

export function AnnexListEditor({
    value,
    onChange,
    label,
}: {
    value: AnnexItem[];
    onChange: (v: AnnexItem[]) => void;
    label: string;
}) {
    const add = () => onChange([...value, { annex_url: '' }]);
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const setUrl = (i: number, url: string) =>
        onChange(
            value.map((v, idx) => (idx === i ? { ...v, annex_url: url } : v)),
        );

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {label}
                </label>
                <button
                    type="button"
                    onClick={add}
                    className="text-xs text-blue-400 hover:text-blue-300"
                >
                    + 添加附件
                </button>
            </div>
            {value.length === 0 && (
                <p className="text-xs text-slate-700">暂无附件</p>
            )}
            {value.map((item, i) => (
                <div key={i} className="mb-2 flex items-start gap-2">
                    <div className="flex-1">
                        <OssUploadField
                            value={item.annex_url}
                            onChange={(url) => setUrl(i, url)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="mt-1 text-slate-600 hover:text-red-400"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}
