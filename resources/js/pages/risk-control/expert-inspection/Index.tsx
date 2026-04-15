import { Head } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function ExpertInspection() {
    return (
        <>
            <Head title="专家检查" />
            <PlaceholderPage
                title="专家检查"
                description="记录与管理第三方专家现场安全检查的问题清单及整改意见"
                icon={UserCheck}
                accent="emerald"
            />
        </>
    );
}
