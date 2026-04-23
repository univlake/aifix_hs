import { ClipboardList } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function DisposalNoticesIndex() {
    return (
        <PlaceholderPage
            title="处置通知公告"
            description="发布针对安全隐患、违规行为的处置通知，督促下属企业限期整改落实。"
            icon={ClipboardList}
            accent="amber"
        />
    );
}
