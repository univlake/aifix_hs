import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function NoticeStatsIndex() {
    return (
        <PlaceholderPage
            title="通知公告反馈统计"
            description="统计下属企业对集团通知公告的阅读率与执行反馈情况，追踪落实进度。"
            icon={BarChart3}
            accent="cyan"
        />
    );
}
