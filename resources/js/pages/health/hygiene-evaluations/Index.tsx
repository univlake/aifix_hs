import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const EVAL_TYPES = [
    { value: '职业危害现状评价', label: '职业危害现状评价' },
    { value: '职业卫生检测', label: '职业卫生检测' },
];

const config: CrudPageConfig = {
    title: '职业卫生评价与检测',
    endpoint: '/hygiene-evaluations',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'name', header: '评价名称' },
        { key: 'type', header: '评价或检测类型', width: 150 },
        {
            key: 'skill_unit_id',
            header: '检测机构',
            width: 160,
            render: (_, row) => {
                const unit = row.skill_unit as { name?: string } | null;

                return unit?.name ? (
                    String(unit.name)
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            key: 'skill_unit_kid_id',
            header: '资质证书',
            width: 160,
            render: (_, row) => {
                const kid = row.skill_unit_kid as {
                    qualification_name?: string;
                } | null;

                return kid?.qualification_name ? (
                    String(kid.qualification_name)
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        {
            key: 'valid_period',
            header: '有效期',
            width: 120,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
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
            label: '评价名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        {
            key: 'type',
            label: '评价或检测类型',
            type: 'select',
            options: EVAL_TYPES,
            placeholder: '请选择类型',
        },
        {
            key: 'skill_unit_id',
            label: '检测机构',
            type: 'select',
            optionsEndpoint: '/skill-units',
            optionsLabelKey: 'name',
            optionsValueKey: 'id',
        },
        {
            key: 'skill_unit_kid_id',
            label: '资质证书',
            type: 'select',
            dependsOnField: 'skill_unit_id',
            dependsOnEndpoint: '/skill-units/{value}',
            dependsOnDataKey: 'kids',
            optionsLabelKey: 'qualification_name',
            optionsValueKey: 'id',
            placeholder: '请先选择检测机构',
        },
        { key: 'valid_period', label: '有效期', type: 'date' },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索评价名称...',
    permissions: {
        list: 'hygiene-evaluations.list',
        create: 'hygiene-evaluations.create',
        update: 'hygiene-evaluations.update',
        delete: 'hygiene-evaluations.delete',
    },
};

export default function HygieneEvaluationsIndex() {
    return <CrudPage config={config} />;
}
