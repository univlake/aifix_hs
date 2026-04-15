import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ClipboardList } from 'lucide-react';

export default function TaskNoticesIndex() {
    return (
        <PlaceholderPage
            title="通知公告"
            description="接收并处理上级下发的通知公告，确认阅读状态并反馈执行情况。"
            icon={ClipboardList}
            accent="blue"
        />
    );
}
