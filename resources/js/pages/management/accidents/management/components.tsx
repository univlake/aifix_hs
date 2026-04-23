export function LevelBadge({ level }: { level: string | null }) {
    if (!level) {
        return <span className="text-slate-700">—</span>;
    }

    const color =
        level === '特别重大事故'
            ? 'bg-red-600/20 text-red-400 border-red-500/30'
            : level === '重大事故'
              ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
              : level === '较大事故'
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/30'
                : level === '一般事故'
                  ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-slate-600/20 text-slate-400 border-slate-500/30';

    return (
        <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${color}`}
        >
            {level}
        </span>
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
