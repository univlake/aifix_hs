import { PlaceholderPage } from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function ManuscriptsIndex() {
    return (
        <PlaceholderPage
            title="信息稿件管理"
            description="编写并提交安全生产信息稿件至上级，记录稿件状态与审核反馈。"
            icon={FileText}
            accent="blue"
        />
    );
}
