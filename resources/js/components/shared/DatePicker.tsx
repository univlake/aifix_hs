import { zhCN } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    clearable?: boolean;
}

/**
 * Format a Date as `YYYY-MM-DD` using local time (avoids UTC offset shifts
 * that appear when ISO-stringifying a midnight-local Date).
 */
function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function parseDate(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);

    if (!y || !m || !d) {
        return undefined;
    }

    return new Date(y, m - 1, d);
}

export function DatePicker({
    value,
    onChange,
    placeholder = '选择日期',
    className,
    disabled,
    clearable = true,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = useMemo(() => parseDate(value), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn('relative', className)}>
                <PopoverTrigger
                    disabled={disabled}
                    className={cn(
                        'flex w-full items-center gap-2 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 pr-9 text-sm text-slate-200 outline-none transition-colors hover:border-blue-500/40 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50',
                        !value && 'text-slate-500',
                    )}
                >
                    <span className="flex-1 truncate text-left">
                        {value || placeholder}
                    </span>
                </PopoverTrigger>
                {clearable && value && !disabled ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-red-400"
                        aria-label="清除"
                    >
                        <X className="h-3 w-3" />
                    </button>
                ) : (
                    <CalendarIcon className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                )}
            </div>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(d) => {
                        if (d) {
                            onChange(formatDate(d));
                            setOpen(false);
                        }
                    }}
                    locale={zhCN}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
