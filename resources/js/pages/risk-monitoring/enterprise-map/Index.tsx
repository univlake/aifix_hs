import { Head } from '@inertiajs/react';
import { Map } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function EnterpriseMap() {
    return (
        <>
            <Head title="企业分布图" />
            <PlaceholderPage
                title="企业分布图"
                description="以地图可视化形式展示辖区内所有企业的地理分布情况"
                icon={Map}
                accent="blue"
            />
        </>
    );
}
