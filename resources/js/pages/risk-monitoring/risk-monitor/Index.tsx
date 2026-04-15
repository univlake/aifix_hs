import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function RiskMonitor() {
    return (
        <>
            <Head title="风险监控" />
            <PlaceholderPage
                title="风险监控"
                description="实时监控企业风险指标变化趋势，预警高风险区域与设备"
                icon={Activity}
                accent="red"
            />
        </>
    );
}
