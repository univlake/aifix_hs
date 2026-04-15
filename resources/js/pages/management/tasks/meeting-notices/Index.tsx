import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarDays } from 'lucide-react';

export default function MeetingNoticesIndex() {
    return (
        <PlaceholderPage
            title="会议通知"
            description="发布集团会议通知，管理会议议程、参会人员及签到确认情况。"
            icon={CalendarDays}
            accent="blue"
        />
    );
}
