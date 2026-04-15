import { Head } from '@inertiajs/react';
import { Radar } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function HazardMap() {
    return (
        <>
            <Head title="重大危险源分布图" />
            <PlaceholderPage
                title="重大危险源分布图"
                description="在地图上标注重大危险源的位置、类型及风险等级分布"
                icon={Radar}
                accent="amber"
            />
        </>
    );
}
