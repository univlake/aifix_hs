import { cn } from '@/lib/utils';

export function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block text-xs text-slate-400">
            <span className="mb-1 block">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </span>
            {children}
        </label>
    );
}

export function TabButton({
    active,
    onClick,
    count,
    children,
}: {
    active: boolean;
    onClick: () => void;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative -mb-px px-3 py-2 text-sm transition-colors',
                active
                    ? 'border-b-2 border-blue-400 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300',
            )}
            type="button"
        >
            {children}
            {typeof count === 'number' && (
                <span className="ml-1.5 rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
                    {count}
                </span>
            )}
        </button>
    );
}
