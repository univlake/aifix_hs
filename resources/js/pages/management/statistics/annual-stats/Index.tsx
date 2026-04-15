import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function AnnualStatsIndex() {
    return (
        <PlaceholderPage
            title="年度报表统计"
            description="汇总并分析各下属企业年度安全生产数据，生成集团年度安全生产综合报告。"
            icon={BarChart3}
            accent="cyan"
        />
    );
}
