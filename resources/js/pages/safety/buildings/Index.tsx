import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '建筑物及构筑物',
    endpoint: '/buildings',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'structure', header: '结构类型' },
        { key: 'area', header: '面积' },
        { key: 'fire_class', header: '火灾危险性' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        {
            key: 'structure',
            label: '结构类型',
            type: 'text',
            placeholder: '如：钢筋混凝土、砖混、钢结构',
        },
        { key: 'area', label: '面积', type: 'text', placeholder: '如：1200㎡' },
        {
            key: 'fire_class',
            label: '火灾危险性',
            type: 'select',
            options: [
                { value: '甲', label: '甲类' },
                { value: '乙', label: '乙类' },
                { value: '丙', label: '丙类' },
                { value: '丁', label: '丁类' },
            ],
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索建筑名称...',
    permissions: {
        list: 'buildings.list',
        create: 'buildings.create',
        update: 'buildings.update',
        delete: 'buildings.delete',
    },
};

export default function BuildingsIndex() {
    return <CrudPage config={config} />;
}
