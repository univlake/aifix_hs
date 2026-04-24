import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const FIRE_SAFETY_TYPES = [
    { value: '消防安全评估', label: '消防安全评估' },
    { value: '消防设施检测', label: '消防设施检测' },
];

const config: CrudPageConfig = {
    title: '消防安全',
    endpoint: '/fire-safeties',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'name', header: '名称' },
        {
            key: 'type',
            header: '评价或检测类型',
            width: 150,
            render: (value) =>
                value ? (
                    <span className="rounded-md border border-red-900/40 bg-red-600/8 px-2 py-0.5 text-xs text-red-400">
                        {value as string}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
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
            header: '报告有效期',
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
            label: '名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        {
            key: 'type',
            label: '评价或检测类型',
            type: 'select',
            options: FIRE_SAFETY_TYPES,
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
        { key: 'valid_period', label: '报告有效期', type: 'date' },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索消防安全名称...',
    permissions: {
        list: 'fire-safeties.list',
        create: 'fire-safeties.create',
        update: 'fire-safeties.update',
        delete: 'fire-safeties.delete',
    },
};

export default function FireSafetiesIndex() {
    return <CrudPage config={config} />;
}
