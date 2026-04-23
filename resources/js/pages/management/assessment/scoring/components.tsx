import { cn } from '@/lib/utils';
import { inputCls, yearOptions } from './types';

export function YearSelect({
    value,
    onChange,
}: {
    value: number;
    onChange: (y: number) => void;
}) {
    return (
        <select
            className={cn(inputCls, 'w-28')}
            value={String(value)}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            {yearOptions().map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
            ))}
        </select>
    );
}
