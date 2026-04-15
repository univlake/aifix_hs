import { PlaceholderPage } from '@/components/PlaceholderPage';
import { AlertTriangle } from 'lucide-react';

export default function HiddenDangerManagementIndex() {
    return (
        <PlaceholderPage
            title="隐患管理"
            description="汇总下属企业安全隐患上报情况，跟踪重大隐患整改进度，实现集团级闭环管理。"
            icon={AlertTriangle}
            accent="amber"
        />
    );
}
