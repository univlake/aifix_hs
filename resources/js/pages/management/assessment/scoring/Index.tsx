import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Trophy } from 'lucide-react';

export default function AssessmentScoringIndex() {
    return (
        <PlaceholderPage
            title="考核评分"
            description="对下属企业安全生产情况进行量化评分，支持多维度指标权重配置。"
            icon={Trophy}
            accent="amber"
        />
    );
}
