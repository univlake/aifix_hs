import { cn } from '@/lib/utils';

export function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative -mb-px px-4 py-2 text-sm transition-colors',
                active
                    ? 'border-b-2 border-blue-400 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300',
            )}
        >
            {children}
        </button>
    );
}

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
