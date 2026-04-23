import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '变更管理',
    endpoint: '/change-manages',
    labelKey: 'title',
    searchField: 'title',
    searchPlaceholder: '搜索变更标题...',
    enableDetail: true,
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '变更标题' },
        { key: 'department_name', header: '申请部门', width: 130 },
        {
            key: 'apply_date',
            header: '申请日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'approve_date',
            header: '审批日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        {
            key: 'approve',
            header: '审批意见',
            render: (val) => {
                const str = val ? String(val) : '';

                if (!str) {
                    return <span className="text-slate-700">—</span>;
                }

                return (
                    <span title={str}>
                        {str.length > 20 ? str.slice(0, 20) + '…' : str}
                    </span>
                );
            },
        },
        {
            key: 'acceptance_info_date',
            header: '验收日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'title',
            label: '变更标题',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        { key: 'department_name', label: '申请部门', type: 'text', colSpan: 1 },
        { key: 'apply_date', label: '申请日期', type: 'date', colSpan: 1 },
        { key: 'reason', label: '变更原因', type: 'textarea', colSpan: 2 },
        {
            key: 'risk_analyze',
            label: '风险分析',
            type: 'textarea',
            colSpan: 2,
        },
        {
            key: 'apply_leader_opinion',
            label: '申请部门负责人意见',
            type: 'textarea',
            colSpan: 1,
        },
        {
            key: 'apply_leader_opinion_date',
            label: '负责人意见日期',
            type: 'date',
            colSpan: 1,
        },
        {
            key: 'manage_leader_opinion',
            label: '安全管理部门意见',
            type: 'textarea',
            colSpan: 1,
        },
        {
            key: 'manage_leader_opinion_date',
            label: '安全管理意见日期',
            type: 'date',
            colSpan: 1,
        },
        { key: 'approve', label: '审批意见', type: 'textarea', colSpan: 1 },
        { key: 'approve_date', label: '审批日期', type: 'date', colSpan: 1 },
        {
            key: 'acceptance_info',
            label: '验收信息',
            type: 'textarea',
            colSpan: 1,
        },
        {
            key: 'acceptance_info_date',
            label: '验收日期',
            type: 'date',
            colSpan: 1,
        },
    ],
    permissions: {
        list: 'change-manages.list',
        create: 'change-manages.create',
        update: 'change-manages.update',
        delete: 'change-manages.delete',
    },
};

export default function ChangeManagementIndex() {
    return <CrudPage config={config} />;
}
