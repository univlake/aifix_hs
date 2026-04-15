import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function MonthlyStatsIndex() {
    return (
        <PlaceholderPage
            title="月度报表统计"
            description="汇总并分析各下属企业月度安全生产数据上报情况，生成集团月度安全统计报表。"
            icon={BarChart3}
            accent="cyan"
        />
    );
}
