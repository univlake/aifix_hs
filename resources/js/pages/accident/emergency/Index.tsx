import { Users, Package, Activity } from 'lucide-react';
import { useState } from 'react';
import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const teamsConfig: CrudPageConfig = {
    title: '应急队伍',
    endpoint: '/emergency-teams',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        {
            key: 'name',
            header: '队伍名称',
            width: 200,
            render: (val) => {
                const s = val ? String(val) : '';

                return s ? (
                    <span title={s}>
                        {s.length > 20 ? s.slice(0, 20) + '…' : s}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
        { key: 'team_number', header: '队伍人数', width: 100 },
        { key: 'save_user', header: '负责人', width: 120 },
        { key: 'tel', header: '联系电话', width: 140 },
    ],
    formFields: [
        { key: 'name', label: '队伍名称', type: 'text', required: true },
        { key: 'team_number', label: '队伍人数', type: 'text' },
        { key: 'save_user', label: '负责人', type: 'text' },
        { key: 'tel', label: '联系电话', type: 'text' },
        {
            key: 'kids',
            label: '队伍成员',
            type: 'sub-table',
            colSpan: 2,
            subFields: [
                { key: 'name', label: '姓名', placeholder: '成员姓名' },
                { key: 'department', label: '部门', placeholder: '所在部门' },
                { key: 'content', label: '职责', placeholder: '职责描述' },
                { key: 'tel', label: '联系电话', placeholder: '电话号码' },
            ],
        },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索队伍名称...',
    permissions: {
        list: 'emergency-teams.list',
        create: 'emergency-teams.create',
        update: 'emergency-teams.update',
        delete: 'emergency-teams.delete',
    },
};

const suppliesConfig: CrudPageConfig = {
    title: '应急物资',
    endpoint: '/emergency-supplies',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'name', header: '物资名称' },
        { key: 'number', header: '数量', width: 100 },
        { key: 'save_user', header: '负责人', width: 120 },
        { key: 'tel', header: '联系电话', width: 140 },
        {
            key: 'comment',
            header: '备注',
            render: (val) => {
                const s = val ? String(val) : '';

                return s ? (
                    <span title={s}>
                        {s.length > 30 ? s.slice(0, 30) + '…' : s}
                    </span>
                ) : (
                    <span className="text-slate-700">—</span>
                );
            },
        },
    ],
    formFields: [
        { key: 'name', label: '物资名称', type: 'text', required: true },
        { key: 'number', label: '数量', type: 'text' },
        { key: 'save_user', label: '负责人', type: 'text' },
        { key: 'tel', label: '联系电话', type: 'text' },
        { key: 'comment', label: '备注', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索物资名称...',
};

const drillConfig: CrudPageConfig = {
    title: '应急演练',
    endpoint: '/emergency-drills',
    labelKey: 'name',
    enableDetail: true,
    columns: [
        { key: 'name', header: '演练名称' },
        {
            key: 'drill_time',
            header: '演练时间',
            width: 110,
            render: (val) =>
                val ? (
                    String(val).slice(0, 10)
                ) : (
                    <span className="text-slate-700">—</span>
                ),
        },
        { key: 'drill_local', header: '演练地点', width: 130 },
        { key: 'organization_department', header: '组织部门', width: 130 },
        { key: 'drill_type', header: '演练类型', width: 100 },
        { key: 'drill_number', header: '参演人数', width: 90 },
    ],
    formFields: [
        {
            key: 'name',
            label: '演练名称',
            type: 'text',
            required: true,
            colSpan: 2,
        },
        { key: 'drill_time', label: '演练时间', type: 'date' },
        { key: 'drill_local', label: '演练地点', type: 'text' },
        { key: 'organization_department', label: '组织部门', type: 'text' },
        { key: 'join_department', label: '参与部门', type: 'text' },
        { key: 'drill_number', label: '参演人数', type: 'text' },
        {
            key: 'drill_type',
            label: '演练类型',
            type: 'select',
            options: [
                { value: '安全生产', label: '安全生产' },
                { value: '消防安全', label: '消防安全' },
            ],
            placeholder: '请选择演练类型',
        },
        {
            key: 'drill_form',
            label: '演练形式',
            type: 'select',
            options: [
                { value: '实战演练', label: '实战演练' },
                { value: '桌面演练', label: '桌面演练' },
            ],
            placeholder: '请选择演练形式',
        },
        {
            key: 'drill_kind',
            label: '演练预案种类',
            type: 'select',
            options: [
                { value: '综合演练', label: '综合演练' },
                { value: '专项演练', label: '专项演练' },
                { value: '现场处置方案', label: '现场处置方案' },
            ],
            placeholder: '请选择演练预案种类',
        },
        { key: 'event', label: '假定事件', type: 'textarea', colSpan: 2 },
        { key: 'annex_url', label: '演练情况', type: 'file', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索演练名称...',
};

type TabKey = 'teams' | 'supplies' | 'drill';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'teams', label: '应急队伍', icon: Users },
    { key: 'supplies', label: '应急物资', icon: Package },
    { key: 'drill', label: '应急演练', icon: Activity },
];

const TAB_CONFIGS: Record<TabKey, CrudPageConfig> = {
    teams: teamsConfig,
    supplies: suppliesConfig,
    drill: drillConfig,
};

export default function EmergencyIndex() {
    const [activeTab, setActiveTab] = useState<TabKey>('teams');

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
