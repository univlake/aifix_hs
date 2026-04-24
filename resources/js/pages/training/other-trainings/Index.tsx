import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '第三方培训',
    endpoint: '/other-trainings',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '培训名称' },
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
        { key: 'object', header: '培训对象', width: 150 },
        { key: 'number', header: '参加人数', width: 80 },
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
            colSpan: 1,
        },
        { key: 'training_date', label: '培训日期', type: 'date', colSpan: 1 },
        { key: 'number', label: '参加人数', type: 'number', colSpan: 1 },
        {
            key: 'object',
            label: '培训对象',
            type: 'text',
            placeholder: '如：全体员工、特种作业人员等',
            colSpan: 1,
        },
        {
            key: 'task_content',
            label: '作业内容',
            type: 'textarea',
            colSpan: 2,
        },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '培训附件', type: 'file', colSpan: 1 },
        {
            key: 'summary_annex_url',
            label: '总结附件',
            type: 'file',
            colSpan: 1,
        },
        {
            key: 'sign_annex_url',
            label: '签到表附件',
            type: 'file',
            colSpan: 1,
        },
        {
            key: 'material_annex_url',
            label: '材料附件',
            type: 'file',
            colSpan: 1,
        },
        { key: 'photo_annex_url', label: '照片附件', type: 'file', colSpan: 1 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索第三方培训...',
    permissions: {
        list: 'other-trainings.list',
        create: 'other-trainings.create',
        update: 'other-trainings.update',
        delete: 'other-trainings.delete',
    },
};

export default function OtherTrainingsIndex() {
    return <CrudPage config={config} />;
}
