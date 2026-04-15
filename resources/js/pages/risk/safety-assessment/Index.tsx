import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ShieldAlert } from 'lucide-react';

export default function SafetyAssessmentIndex() {
    return (
        <PlaceholderPage
            title="安全评估检查"
            description="开展安全生产综合评估与专项检查，跟踪问题整改落实情况。"
            icon={ShieldAlert}
            accent="amber"
        />
    );
}
