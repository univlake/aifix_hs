import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ClipboardList } from 'lucide-react';

export default function ManagementNoticesIndex() {
    return (
        <PlaceholderPage
            title="通知公告"
            description="向下属企业发布安全生产通知公告，跟踪各企业阅读及执行反馈情况。"
            icon={ClipboardList}
            accent="blue"
        />
    );
}
