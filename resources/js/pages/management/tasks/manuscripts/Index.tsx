import { PlaceholderPage } from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function ManagementManuscriptsIndex() {
    return (
        <PlaceholderPage
            title="信息稿件管理"
            description="审核并管理下属企业上报的安全生产信息稿件，汇编发布集团安全资讯。"
            icon={FileText}
            accent="blue"
        />
    );
}
