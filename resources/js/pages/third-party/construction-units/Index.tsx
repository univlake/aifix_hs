import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '施工单位',
    endpoint: '/construction-units',
    columns: [
        { key: 'name', header: '单位名称' },
        { key: 'qualification_name', header: '资质名称', width: 180 },
        { key: 'contact', header: '联系人', width: 110 },
        { key: 'contact_tel', header: '联系电话', width: 140 },
    ],
    formFields: [
        { key: 'name', label: '单位名称', type: 'text', required: true },
        { key: 'qualification_name', label: '资质名称', type: 'text' },
        { key: 'contact', label: '联系人', type: 'text' },
        { key: 'contact_tel', label: '联系电话', type: 'text' },
        { key: 'annex_url', label: '附件链接', type: 'text', colSpan: 2 },
    ],
    searchField: 'name',
    searchPlaceholder: '搜索单位名称...',
};

export default function ConstructionUnitsIndex() {
    return <CrudPage config={config} />;
}
