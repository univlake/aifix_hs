import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';
import { cn } from '@/lib/utils';

function ExpiryCell({ value }: { value: unknown }) {
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

const CHECKUP_TYPES = [
    { value: '上岗前体检', label: '上岗前体检' },
    { value: '在岗期间体检', label: '在岗期间体检' },
    { value: '离岗体检', label: '离岗体检' },
    { value: '应急体检', label: '应急体检' },
];

const config: CrudPageConfig = {
    title: '职业健康检查',
    endpoint: '/health-checkups',
    columns: [
        {
            key: 'type',
            header: '检查类型',
            render: (value) => value
                ? <span className="rounded-md border border-cyan-900/40 bg-cyan-600/8 px-2 py-0.5 text-xs text-cyan-400">{value as string}</span>
                : <span className="text-slate-700">—</span>,
        },
        { key: 'department', header: '部门', width: 140 },
        { key: 'number', header: '检查人数', width: 100 },
        { key: 'checkup_date', header: '检查日期', width: 110 },
        {
            key: 'checkup_expiry',
            header: '有效期',
            width: 130,
            render: (value) => <ExpiryCell value={value} />,
        },
    ],
    formFields: [
        {
            key: 'type',
            label: '检查类型',
            type: 'select',
            required: true,
            options: CHECKUP_TYPES,
            placeholder: '请选择检查类型',
        },
        { key: 'department', label: '部门', type: 'text' },
        { key: 'number', label: '检查人数', type: 'text' },
        { key: 'checkup_date', label: '检查日期', type: 'date' },
        { key: 'checkup_expiry', label: '有效期至', type: 'date' },
        { key: 'measure', label: '处理措施', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '附件链接', type: 'text', colSpan: 2 },
    ],
    searchField: 'type',
    searchPlaceholder: '搜索检查类型...',
};

export default function HealthCheckupsIndex() {
    return <CrudPage config={config} />;
}
