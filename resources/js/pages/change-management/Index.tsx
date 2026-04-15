import { PlaceholderPage } from '@/components/PlaceholderPage';
import { RefreshCw } from 'lucide-react';

export default function ChangeManagementIndex() {
    return (
        <PlaceholderPage
            title="变更管理"
            description="管理工艺、设备、人员等安全生产相关变更事项，确保变更风险得到有效控制。"
            icon={RefreshCw}
            accent="violet"
        />
    );
}
