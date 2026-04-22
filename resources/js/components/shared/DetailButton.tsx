import { Eye } from 'lucide-react';

interface DetailButtonProps<T> {
    row: T;
    onOpen: (row: T) => void;
    label?: string;
    title?: string;
    className?: string;
}

const defaultClass =
    'flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300';

export function DetailButton<T>({
    row,
    onOpen,
    label = '详情',
    title = '详情',
    className,
}: DetailButtonProps<T>) {
    return (
        <button
            type="button"
            onClick={() => onOpen(row)}
            title={title}
            className={className ?? defaultClass}
        >
            <Eye className="h-3.5 w-3.5" />
            <span>{label}</span>
        </button>
    );
}
