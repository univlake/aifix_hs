import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BadgeCheck } from 'lucide-react';

export default function QualificationsIndex() {
    return (
        <PlaceholderPage
            title="安全资质管理"
            description="管理企业安全生产相关证书、资质及许可证，确保合规运营。"
            icon={BadgeCheck}
            accent="blue"
        />
    );
}
