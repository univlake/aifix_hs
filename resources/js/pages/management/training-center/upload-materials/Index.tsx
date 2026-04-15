import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BookOpen } from 'lucide-react';

export default function UploadMaterialsIndex() {
    return (
        <PlaceholderPage
            title="上传资料"
            description="上传集团级安全培训文档资料，统一推送至各下属企业培训中心。"
            icon={BookOpen}
            accent="emerald"
        />
    );
}
