import { PlaceholderPage } from '@/components/PlaceholderPage';
import { GitMerge } from 'lucide-react';

export default function HazardousProcessIndex() {
    return (
        <PlaceholderPage
            title="较危险工艺"
            description="管理较危险化工工艺信息，记录工艺特性、操作规程及风险控制要求。"
            icon={GitMerge}
            accent="cyan"
        />
    );
}
