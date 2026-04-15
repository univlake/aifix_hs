import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { cn } from '@/lib/utils';

function ValidPeriodCell({ value }: { value: unknown }) {
    if (!value) return <span className="text-slate-700">—</span>;
    const date = new Date(value as string);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    const expired = daysLeft < 0;
    const nearExpiry = daysLeft >= 0 && daysLeft <= 30;
    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
            expired
                ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                : nearExpiry
                  ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400',
        )}>
            {expired && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
            {nearExpiry && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
            {value as string}
        </span>
    );
}

const FIRE_SAFETY_TYPES = [
    { value: '消防培训', label: '消防培训' },
    { value: '消防演练', label: '消防演练' },
    { value: '消防检查', label: '消防检查' },
    { value: '消防整改', label: '消防整改' },
    { value: '其他', label: '其他' },
];

const config: CrudPageConfig = {
    title: '消防安全管理',
    endpoint: '/fire-safeties',
    columns: [
        { key: 'name', header: '名称' },
        {
            key: 'type',
            header: '类型',
            width: 120,
            render: (value) => value
                ? <span className="rounded-md border border-red-900/40 bg-red-600/8 px-2 py-0.5 text-xs text-red-400">{value as string}</span>
                : <span className="text-slate-700">—</span>,
        },
        {
            key: 'valid_period',
            header: '有效期',
            width: 130,
            render: (value) => <ValidPeriodCell value={value} />,
        },
    ],
    formFields: [
        { key: 'name', label: '名称', type: 'text', required: true },
        {
            key: 'type',
            label: '类型',
            type: 'select',
            options: FIRE_SAFETY_TYPES,
            placeholder: '请选择类型',
        },
        { key: 'valid_period', label: '有效期', type: 'date' },
        { key: 'annex_url', label: '附件链接', type: 'text', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索消防安全名称...',
};

export default function FireSafetiesIndex() {
    return <CrudPage config={config} />;
}
