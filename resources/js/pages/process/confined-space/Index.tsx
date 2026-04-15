import { PlaceholderPage } from '@/components/PlaceholderPage';
import { GitMerge } from 'lucide-react';

export default function ConfinedSpaceIndex() {
    return (
        <PlaceholderPage
            title="有限空间辨识"
            description="辨识和登记企业有限空间作业场所，制定进入许可和应急救援措施。"
            icon={GitMerge}
            accent="amber"
        />
    );
}
