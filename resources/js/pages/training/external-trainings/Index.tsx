import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '外部培训',
    endpoint: '/external-trainings',
    labelKey: 'name',
    searchField: 'name',
    searchPlaceholder: '搜索培训名称...',
    enableDetail: true,
    columns: [
        { key: 'name', header: '培训名称' },
        { key: 'training_unit', header: '培训单位', width: 160 },
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
            key: 'training_unit',
            label: '培训单位',
            type: 'text',
            placeholder: '承办本次培训的外部机构名称',
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
            placeholder: '如：管理层、特种作业人员等',
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
        list: 'external-trainings.list',
        create: 'external-trainings.create',
        update: 'external-trainings.update',
        delete: 'external-trainings.delete',
    },
};

export default function ExternalTrainingsIndex() {
    return <CrudPage config={config} />;
}
