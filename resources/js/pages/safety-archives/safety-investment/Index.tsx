import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function SafetyInvestmentIndex() {
    return (
        <PlaceholderPage
            title="安全投入"
            description="记录和统计安全生产专项经费投入情况，保障安全资金合理使用。"
            icon={BarChart3}
            accent="blue"
        />
    );
}
