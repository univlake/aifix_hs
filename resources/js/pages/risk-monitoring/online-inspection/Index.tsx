import { Head } from '@inertiajs/react';
import { ScanLine } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function OnlineInspection() {
    return (
        <>
            <Head title="在线巡检" />
            <PlaceholderPage
                title="在线巡检"
                description="实时查看巡检人员位置轨迹、巡检任务执行情况及异常上报"
                icon={ScanLine}
                accent="cyan"
            />
        </>
    );
}
