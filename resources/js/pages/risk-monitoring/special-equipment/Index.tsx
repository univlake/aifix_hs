import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Cog } from 'lucide-react';

export default function SpecialEquipmentStatsIndex() {
    return (
        <PlaceholderPage
            title="特种设备数据统计"
            description="汇总下属企业特种设备数量、检验状态及逾期情况，进行集团级统计分析。"
            icon={Cog}
            accent="cyan"
        />
    );
}
