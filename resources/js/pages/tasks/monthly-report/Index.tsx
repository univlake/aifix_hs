import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function MonthlyReportIndex() {
    return (
        <PlaceholderPage
            title="月度数据上报"
            description="按月填报安全生产关键指标数据，向上级单位提交月度安全生产报告。"
            icon={BarChart3}
            accent="blue"
        />
    );
}
