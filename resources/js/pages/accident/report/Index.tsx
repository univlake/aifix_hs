import { CrudPage } from '@/components/shared/CrudPage';
import { accidentReportConfig } from './config';

export default function AccidentReportIndex() {
    return <CrudPage config={accidentReportConfig} />;
}
