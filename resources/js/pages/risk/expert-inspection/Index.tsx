import { PlaceholderPage } from '@/components/PlaceholderPage';
import { UserCheck } from 'lucide-react';

export default function ExpertInspectionIndex() {
    return (
        <PlaceholderPage
            title="专家检查"
            description="管理上级下达的专家检查任务，记录检查结果及整改要求。"
            icon={UserCheck}
            accent="amber"
        />
    );
}
