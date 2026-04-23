import { Construction } from 'lucide-react';

type Accent = 'blue' | 'cyan' | 'violet' | 'amber' | 'red' | 'emerald';

const accentMap: Record<
    Accent,
    {
        border: string;
        iconWrap: string;
        iconColor: string;
        dot: string;
        tag: string;
    }
> = {
    blue: {
        border: 'border-blue-900/40',
        iconWrap: 'bg-blue-600/15 border-blue-600/20',
        iconColor: 'text-blue-400',
        dot: 'bg-blue-400',
        tag: 'border-blue-500/30 bg-blue-600/10 text-blue-400',
    },
    cyan: {
        border: 'border-cyan-900/40',
        iconWrap: 'bg-cyan-600/15 border-cyan-600/20',
        iconColor: 'text-cyan-400',
        dot: 'bg-cyan-400',
        tag: 'border-cyan-500/30 bg-cyan-600/10 text-cyan-400',
    },
    violet: {
        border: 'border-violet-900/40',
        iconWrap: 'bg-violet-600/15 border-violet-600/20',
        iconColor: 'text-violet-400',
        dot: 'bg-violet-400',
        tag: 'border-violet-500/30 bg-violet-600/10 text-violet-400',
    },
    amber: {
        border: 'border-amber-900/40',
        iconWrap: 'bg-amber-600/15 border-amber-600/20',
        iconColor: 'text-amber-400',
        dot: 'bg-amber-400',
        tag: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
    },
    red: {
        border: 'border-red-900/40',
        iconWrap: 'bg-red-600/15 border-red-600/20',
        iconColor: 'text-red-400',
        dot: 'bg-red-400',
        tag: 'border-red-500/30 bg-red-600/10 text-red-400',
    },
    emerald: {
        border: 'border-emerald-900/40',
        iconWrap: 'bg-emerald-600/15 border-emerald-600/20',
        iconColor: 'text-emerald-400',
        dot: 'bg-emerald-400',
        tag: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
    },
};

interface Props {
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: Accent;
}

export function PlaceholderPage({
    title,
    description,
    icon: Icon,
    accent = 'blue',
}: Props) {
    const a = accentMap[accent];

    return (
        <div>
            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${a.tag}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
                    开发中
                </span>
            </div>

            {/* Placeholder card */}
            <div className={`rounded-xl border ${a.border} bg-[#0d1530]`}>
                <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
                    <div
                        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${a.iconWrap}`}
                    >
                        <Icon className={`h-8 w-8 ${a.iconColor}`} />
                    </div>
                    <h2 className="text-base font-semibold text-slate-300">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                            {description}
                        </p>
                    )}
                    <div className="mt-8 flex items-center gap-2 rounded-lg border border-blue-900/30 bg-[#070d1f]/60 px-4 py-2.5 text-xs text-slate-600">
                        <Construction className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                        该模块正在开发中，功能将在后续版本中上线
                    </div>
                </div>
            </div>
        </div>
    );
}
