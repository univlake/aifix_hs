import { PlaceholderPage } from '@/components/PlaceholderPage';
import { GitMerge } from 'lucide-react';

export default function KeyHazardousProcessIndex() {
    return (
        <PlaceholderPage
            title="重点监管危险工艺"
            description="管理列入重点监管目录的危险化工工艺，记录工艺参数及安全控制措施。"
            icon={GitMerge}
            accent="cyan"
        />
    );
}
