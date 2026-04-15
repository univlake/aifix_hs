import { PlaceholderPage } from '@/components/PlaceholderPage';
import { FolderOpen } from 'lucide-react';

export default function OrgStructureIndex() {
    return (
        <PlaceholderPage
            title="安全生产组织架构"
            description="管理企业安全生产组织架构，包括部门设置、职责分工及人员配置。"
            icon={FolderOpen}
            accent="blue"
        />
    );
}
