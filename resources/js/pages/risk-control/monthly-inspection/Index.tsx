import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function MonthlyInspection() {
    return (
        <>
            <Head title="月度排查" />
            <PlaceholderPage
                title="月度排查"
                description="管理每月安全生产隐患排查计划、任务下达与整改跟踪"
                icon={Search}
                accent="violet"
            />
        </>
    );
}
