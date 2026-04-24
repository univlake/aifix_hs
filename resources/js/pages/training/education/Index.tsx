import { BookOpen, Globe, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const internalConfig: CrudPageConfig = {
    title: '内部培训',
    endpoint: '/internal-trainings',
    labelKey: 'name',
    searchField: 'name',
    searchPlaceholder: '搜索培训名称...',
    enableDetail: true,
    columns: [
        {
            key: 'name',
            header: '培训名称',
            width: 200,
            render: (val) => (
                <span
                    className="block max-w-[180px] truncate"
                    title={val ? String(val) : ''}
                >
                    {val ? (
                        String(val)
                    ) : (
                        <span className="text-slate-700">—</span>
                    )}
                </span>
            ),
        },
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
        { key: 'number', header: '培训人数', width: 90 },
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
            type: 'select',
            required: true,
            options: [
                { value: '新员工培训', label: '新员工培训' },
                { value: '消防培训', label: '消防培训' },
                { value: '安全培训', label: '安全培训' },
            ],
        },
        { key: 'training_date', label: '培训日期', type: 'date' },
        {
            key: 'number',
            label: '培训人数',
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
            label: '培训情况',
            type: 'textarea',
            placeholder: '描述本次培训的情况及经过',
            colSpan: 2,
        },
        {
            key: 'comment',
            label: '培训内容',
            type: 'textarea',
            placeholder: '培训内容说明',
            colSpan: 2,
        },
        { key: 'annex_url', label: '培训附件', type: 'file' },
        { key: 'summary_annex_url', label: '培训效果评估', type: 'file' },
        { key: 'sign_annex_url', label: '签到表', type: 'file' },
        { key: 'material_annex_url', label: '培训教材', type: 'file' },
        { key: 'photo_annex_url', label: '培训照片', type: 'file' },
    ],
    permissions: {
        list: 'internal-trainings.list',
        create: 'internal-trainings.create',
        update: 'internal-trainings.update',
        delete: 'internal-trainings.delete',
    },
};

const externalConfig: CrudPageConfig = {
    title: '外部培训',
    endpoint: '/external-trainings',
    labelKey: 'name',
    searchField: 'name',
    searchPlaceholder: '搜索培训名称...',
    enableDetail: true,
    columns: [
        {
            key: 'name',
            header: '培训名称',
            width: 200,
            render: (val) => (
                <span
                    className="block max-w-[180px] truncate"
                    title={val ? String(val) : ''}
                >
                    {val ? (
                        String(val)
                    ) : (
                        <span className="text-slate-700">—</span>
                    )}
                </span>
            ),
        },
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
        { key: 'number', header: '培训人数', width: 90 },
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
            label: '培训人数',
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
            label: '培训内容',
            type: 'textarea',
            placeholder: '其他补充说明',
            colSpan: 2,
        },
        { key: 'annex_url', label: '签到表', type: 'file' },
        { key: 'summary_annex_url', label: '培训效果评估', type: 'file' },
        { key: 'sign_annex_url', label: '签到表附件', type: 'file' },
        { key: 'material_annex_url', label: '培训教材', type: 'file' },
        { key: 'photo_annex_url', label: '培训照片', type: 'file' },
    ],
};

const otherConfig: CrudPageConfig = {
    title: '第三方培训',
    endpoint: '/other-trainings',
    labelKey: 'name',
    searchField: 'name',
    searchPlaceholder: '搜索第三方培训...',
    enableDetail: true,
    columns: [
        {
            key: 'name',
            header: '培训名称',
            width: 200,
            render: (val) => (
                <span
                    className="block max-w-[180px] truncate"
                    title={val ? String(val) : ''}
                >
                    {val ? (
                        String(val)
                    ) : (
                        <span className="text-slate-700">—</span>
                    )}
                </span>
            ),
        },
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
        { key: 'number', header: '培训人数', width: 80 },
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
        { key: 'number', label: '培训人数', type: 'number', colSpan: 1 },
        {
            key: 'object',
            label: '培训对象',
            type: 'text',
            placeholder: '如：全体员工、特种作业人员等',
            colSpan: 1,
        },
        {
            key: 'task_content',
            label: '培训任务内容',
            type: 'textarea',
            colSpan: 2,
        },
        { key: 'comment', label: '培训内容', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '签到表', type: 'file', colSpan: 1 },
        {
            key: 'summary_annex_url',
            label: '培训效果评估',
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
            label: '培训教材',
            type: 'file',
            colSpan: 1,
        },
        { key: 'photo_annex_url', label: '培训照片', type: 'file', colSpan: 1 },
    ],
};

type TabKey = 'internal' | 'external' | 'other';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'internal', label: '内部培训', icon: BookOpen },
    { key: 'external', label: '外部培训', icon: Globe },
    { key: 'other', label: '第三方培训', icon: ClipboardList },
];

const TAB_CONFIGS: Record<TabKey, CrudPageConfig> = {
    internal: internalConfig,
    external: externalConfig,
    other: otherConfig,
};

export default function EducationIndex() {
    const [activeTab, setActiveTab] = useState<TabKey>('internal');

    return (
        <>
            <div className="-mx-6 -mt-6 mb-6 flex items-center gap-0.5 border-b border-slate-800/80 px-6">
                {TABS.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <Icon
                                className="h-4 w-4 shrink-0"
                                strokeWidth={1.5}
                            />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <CrudPage key={activeTab} config={TAB_CONFIGS[activeTab]} />
        </>
    );
}
