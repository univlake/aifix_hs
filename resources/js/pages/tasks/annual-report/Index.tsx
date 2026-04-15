import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function AnnualReportIndex() {
    return (
        <PlaceholderPage
            title="年度数据上报"
            description="汇总年度安全生产数据，向上级单位提交年度安全生产综合报告。"
            icon={BarChart3}
            accent="blue"
        />
    );
}
