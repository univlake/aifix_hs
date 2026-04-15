import { PlaceholderPage } from '@/components/PlaceholderPage';
import { AlertOctagon } from 'lucide-react';

export default function ManagementAccidentReportIndex() {
    return (
        <PlaceholderPage
            title="事故上报"
            description="汇总下属企业事故上报情况，审核事故信息并向监管部门进行统一上报。"
            icon={AlertOctagon}
            accent="red"
        />
    );
}
