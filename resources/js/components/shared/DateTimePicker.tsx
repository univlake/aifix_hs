import { zhCN } from 'date-fns/locale';
import { Clock, X } from 'lucide-react';
import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    clearable?: boolean;
}

interface Parsed {
    date?: Date;
    hour: string;
    minute: string;
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

function parse(value: string): Parsed {
    if (!value) {
        return { date: undefined, hour: '', minute: '' };
    }

    // Accept both `YYYY-MM-DD HH:mm[:ss]` and `YYYY-MM-DDTHH:mm` (datetime-local).
    const normalized = value.replace('T', ' ');
    const [datePart = '', timePart = ''] = normalized.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [h = '', mi = ''] = timePart.split(':');
    const date = y && m && d ? new Date(y, m - 1, d) : undefined;

    return { date, hour: h ?? '', minute: mi ?? '' };
}

function emit(date: Date | undefined, hour: string, minute: string): string {
    if (!date) {
        return '';
    }
    const h = hour === '' ? '00' : pad2(Math.min(23, Math.max(0, Number(hour) || 0)));
    const m = minute === '' ? '00' : pad2(Math.min(59, Math.max(0, Number(minute) || 0)));

    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${h}:${m}`;
}

function displayValue(value: string): string {
    return value ? value.slice(0, 16).replace('T', ' ') : '';
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = '选择日期时间',
    className,
    disabled,
    clearable = true,
}: DateTimePickerProps) {
    const parsed = useMemo(() => parse(value), [value]);

    const setDate = (d: Date | undefined) => {
        onChange(emit(d, parsed.hour, parsed.minute));
    };

    const setHour = (raw: string) => {
        const clean = raw.replace(/\D/g, '').slice(0, 2);
        onChange(emit(parsed.date ?? new Date(), clean, parsed.minute));
    };

    const setMinute = (raw: string) => {
        const clean = raw.replace(/\D/g, '').slice(0, 2);
        onChange(emit(parsed.date ?? new Date(), parsed.hour, clean));
    };

    const shown = displayValue(value);

    return (
        <Popover>
            <div className={cn('relative', className)}>
                <PopoverTrigger
                    disabled={disabled}
                    className={cn(
                        'flex w-full items-center gap-2 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 pr-9 text-sm text-slate-200 outline-none transition-colors hover:border-blue-500/40 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50',
                        !shown && 'text-slate-500',
                    )}
                >
                    <span className="flex-1 truncate text-left">
                        {shown || placeholder}
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
                    <Clock className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                )}
            </div>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={parsed.date}
                    onSelect={setDate}
                    locale={zhCN}
                    autoFocus
                />
                <div className="flex items-center gap-2 border-t border-blue-900/30 bg-[#070d1f]/60 px-3 py-2">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">时间</span>
                    <div className="flex flex-1 items-center justify-end gap-1">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={parsed.hour}
                            onChange={(e) => setHour(e.target.value)}
                            placeholder="00"
                            className="h-7 w-10 rounded border border-blue-900/40 bg-[#050915] text-center text-xs text-slate-200 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                            maxLength={2}
                        />
                        <span className="text-xs text-slate-500">:</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={parsed.minute}
                            onChange={(e) => setMinute(e.target.value)}
                            placeholder="00"
                            className="h-7 w-10 rounded border border-blue-900/40 bg-[#050915] text-center text-xs text-slate-200 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                            maxLength={2}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
