import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Siren } from 'lucide-react';

export default function AccidentEmergencyIndex() {
    return (
        <PlaceholderPage
            title="应急管理"
            description="管理企业应急预案、应急演练及应急资源，提升突发事故应对能力。"
            icon={Siren}
            accent="red"
        />
    );
}
