import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ClipboardCheck } from 'lucide-react';

export default function ChecklistsIndex() {
    return (
        <PlaceholderPage
            title="检查表库"
            description="维护各类安全检查表模板，为日常巡检和专项检查提供标准化工具。"
            icon={ClipboardCheck}
            accent="emerald"
        />
    );
}
