import { PlaceholderPage } from '@/components/PlaceholderPage';
import { AlertOctagon } from 'lucide-react';

export default function AccidentReportIndex() {
    return (
        <PlaceholderPage
            title="事故上报"
            description="向上级单位上报生产安全事故信息，填写事故经过、原因分析及整改措施。"
            icon={AlertOctagon}
            accent="red"
        />
    );
}
