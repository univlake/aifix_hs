import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Trophy } from 'lucide-react';

export default function AssessmentResultsIndex() {
    return (
        <PlaceholderPage
            title="考核结果"
            description="查看各下属企业年度安全生产考核评分结果，支持排名对比与趋势分析。"
            icon={Trophy}
            accent="amber"
        />
    );
}
