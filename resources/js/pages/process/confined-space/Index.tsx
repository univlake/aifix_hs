import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '有限空间辨识',
    endpoint: '/space-works',
    labelKey: 'name',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'name', header: '名称' },
        { key: 'position', header: '所在位置' },
        {
            key: 'space_work_type',
            header: '有限空间类型',
            width: 120,
            render: (val) => (val as Record<string, unknown>)?.title as string ?? '—',
        },
        { key: 'size', header: '空间大小', width: 100 },
        { key: 'people_num', header: '作业人数', width: 80 },
    ],
    formFields: [
        { key: 'name', label: '名称', type: 'text', required: true, colSpan: 1 },
        { key: 'position', label: '所在位置', type: 'text', colSpan: 1 },
        { key: 'space_work_type_id', label: '有限空间类型', type: 'select', optionsEndpoint: '/space-work-types', colSpan: 1 },
        { key: 'size', label: '空间大小', type: 'text', placeholder: '如：5m×3m×2m', colSpan: 1 },
        { key: 'people_num', label: '作业人数', type: 'number', colSpan: 1 },
        { key: 'hazard_id', label: '危险因素编号', type: 'text', colSpan: 1 },
        { key: 'word_content', label: '作业内容描述', type: 'textarea', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索有限空间...',
};

export default function ConfinedSpaceIndex() {
    return <CrudPage config={config} />;
}
