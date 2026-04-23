import { CrudPage } from '@/components/shared/CrudPage';
import type { CrudPageConfig } from '@/components/shared/CrudPage';

const config: CrudPageConfig = {
    title: '证书状态管理',
    endpoint: '/certificate-statuses',
    columns: [
        { key: 'id', header: 'ID', width: 60 },
        { key: 'title', header: '名称' },
        { key: 'valid_from', header: '有效期起' },
        { key: 'valid_to', header: '有效期止' },
    ],
    formFields: [
        { key: 'title', label: '名称', type: 'text', required: true },
        { key: 'valid_from', label: '有效期起', type: 'date' },
        { key: 'valid_to', label: '有效期止', type: 'date' },
        {
            key: 'company_id',
            label: '所属单位',
            type: 'select',
            optionsEndpoint: '/companies',
        },
    ],
    searchField: 'title',
    searchPlaceholder: '搜索证书名称...',
    permissions: {
        list: 'certificate-statuses.list',
        create: 'certificate-statuses.create',
        update: 'certificate-statuses.update',
    },
};

export default function CertificateStatusesIndex() {
    return <CrudPage config={config} />;
}
