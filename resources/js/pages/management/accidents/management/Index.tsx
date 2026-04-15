import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Siren } from 'lucide-react';

export default function AccidentManagementIndex() {
    return (
        <PlaceholderPage
            title="事故应急管理"
            description="统筹管理集团应急预案体系，协调下属企业应急资源，组织重大事故应急响应。"
            icon={Siren}
            accent="red"
        />
    );
}
