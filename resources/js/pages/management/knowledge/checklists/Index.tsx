import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ClipboardCheck } from 'lucide-react';

export default function ManagementChecklistsIndex() {
    return (
        <PlaceholderPage
            title="检查表库"
            description="维护集团级标准化安全检查表模板，统一下发至各下属企业使用。"
            icon={ClipboardCheck}
            accent="emerald"
        />
    );
}
