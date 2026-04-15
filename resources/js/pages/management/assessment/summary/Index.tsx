import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Trophy } from 'lucide-react';

export default function AssessmentSummaryIndex() {
    return (
        <PlaceholderPage
            title="考核汇总"
            description="汇总集团年度安全生产考核总体情况，生成考核报告供领导层决策参考。"
            icon={Trophy}
            accent="amber"
        />
    );
}
