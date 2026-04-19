import { CrudPage } from '@/components/shared/CrudPage';
import { accidentReportConfig } from '@/pages/accident/report/config';

export default function ManagementAccidentReportIndex() {
    return <CrudPage config={accidentReportConfig} />;
}
