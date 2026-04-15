import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Award } from 'lucide-react';

export default function AssessmentFilingIndex() {
    return (
        <PlaceholderPage
            title="考核归档"
            description="提交年度安全生产考核自评材料，归档上级考核结果及整改意见。"
            icon={Award}
            accent="amber"
        />
    );
}
