import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '安全评估检查',
    endpoint: '/assess-detects',
    labelKey: 'name',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '名称' },
        { key: 'assess_detect_type', header: '类型', width: 100 },
        {
            key: 'skill_unit',
            header: '评价/检测机构',
            render: (val) => (val as Record<string, unknown>)?.name as string ?? '—',
        },
        { key: 'valid_period', header: '有效期', width: 120 },
    ],
    formFields: [
        { key: 'name', label: '名称', type: 'text', required: true, colSpan: 2 },
        {
            key: 'assess_detect_type',
            label: '类型',
            type: 'select',
            options: [
                { value: '安全评价', label: '安全评价' },
                { value: '安全检测', label: '安全检测' },
            ],
            colSpan: 1,
        },
        { key: 'skill_unit_id', label: '评价/检测机构', type: 'select', optionsEndpoint: '/skill-units', optionsLabelKey: 'name', colSpan: 1 },
        { key: 'valid_period', label: '有效期', type: 'date', colSpan: 1 },
        { key: 'annex_url', label: '附件', type: 'file', colSpan: 1 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索安全评估记录...',
};

export default function SafetyAssessmentIndex() {
    return <CrudPage config={config} />;
}
