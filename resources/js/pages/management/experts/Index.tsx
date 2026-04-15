import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

export default function ExpertsIndex() {
    return (
        <PlaceholderPage
            title="专家库"
            description="管理集团安全生产专家信息库，记录专家资质、领域专长及派遣检查记录。"
            icon={Users}
            accent="violet"
        />
    );
}
