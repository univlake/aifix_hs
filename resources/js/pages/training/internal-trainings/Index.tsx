import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '内部培训',
    endpoint: '/internal-trainings',
    labelKey: 'name',
    searchField: 'name',
    searchPlaceholder: '搜索培训名称...',
    enableDetail: true,
    columns: [
        { key: 'name', header: '培训名称' },
        { key: 'training_type', header: '培训类型', width: 120 },
        {
            key: 'training_date',
            header: '培训日期',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'number', header: '参加人数', width: 90 },
        { key: 'object', header: '培训对象', width: 150 },
        {
            key: 'annex_url',
            header: '附件',
            width: 70,
            render: (val) =>
                val ? (
                    <AttachmentViewer url={String(val)} />
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
    ],
    formFields: [
        {
            key: 'name',
            label: '培训名称',
            type: 'text',
            required: true,
            placeholder: '请输入培训名称',
        },
        {
            key: 'training_type',
            label: '培训类型',
            type: 'text',
            placeholder: '如：安全操作规程、消防安全等',
        },
        { key: 'training_date', label: '培训日期', type: 'date' },
        {
            key: 'number',
            label: '参加人数',
            type: 'number',
            placeholder: '请输入人数',
        },
        {
            key: 'object',
            label: '培训对象',
            type: 'text',
            placeholder: '如：全体员工、特种作业人员等',
            colSpan: 2,
        },
        {
            key: 'happening',
            label: '主要内容',
            type: 'textarea',
            placeholder: '描述本次培训的主要内容及经过',
            colSpan: 2,
        },
        {
            key: 'comment',
            label: '备注',
            type: 'textarea',
            placeholder: '其他补充说明',
            colSpan: 2,
        },
        { key: 'annex_url', label: '培训附件', type: 'file' },
        { key: 'summary_annex_url', label: '总结附件', type: 'file' },
        { key: 'sign_annex_url', label: '签到表附件', type: 'file' },
        { key: 'material_annex_url', label: '材料附件', type: 'file' },
        { key: 'photo_annex_url', label: '照片附件', type: 'file' },
    ],
    permissions: {
        list: 'internal-trainings.list',
        create: 'internal-trainings.create',
        update: 'internal-trainings.update',
        delete: 'internal-trainings.delete',
    },
};

export default function InternalTrainingsIndex() {
    return <CrudPage config={config} />;
}
