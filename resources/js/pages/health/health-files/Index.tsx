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

const config: CrudPageConfig = {
    title: '职业健康档案',
    endpoint: '/health-files',
    columns: [
        { key: 'name', header: '姓名' },
        { key: 'number', header: '工号', width: 100 },
        { key: 'department', header: '部门', width: 130 },
        { key: 'post', header: '岗位', width: 120 },
        { key: 'checkup_date', header: '体检日期', width: 110 },
        {
            key: 'checkup_expiry',
            header: '体检有效期',
            width: 130,
            render: (value) => <ExpiryCell value={value} />,
        },
        { key: 'process_result', header: '处理结果', width: 120 },
    ],
    formFields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'number', label: '工号', type: 'text' },
        { key: 'department', label: '部门', type: 'text' },
        { key: 'post', label: '岗位', type: 'text' },
        { key: 'checkup_date', label: '体检日期', type: 'date' },
        { key: 'checkup_expiry', label: '体检有效期', type: 'date' },
        { key: 'review_situation', label: '复查情况', type: 'text', colSpan: 2 },
        { key: 'handling_opinions', label: '处理意见', type: 'text', colSpan: 2 },
        { key: 'process_result', label: '处理结果', type: 'text', colSpan: 2 },
        { key: 'annex_url', label: '附件链接', type: 'text', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索员工姓名...',
};

export default function HealthFilesIndex() {
    return <CrudPage config={config} />;
}
