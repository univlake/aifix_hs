import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { TabButton } from './components';
import { NoticeTab } from './NoticeTab';
import type { NoticeVariant } from './types';

interface NoticesPageProps {
    receiveOnly?: boolean;
}

export function NoticesPage({ receiveOnly = false }: NoticesPageProps = {}) {
    const [tab, setTab] = useState<NoticeVariant>('office');

    const pageTitle = '通知公告';
    const pageSubtitle = receiveOnly
        ? '查看上级下发的通知公告，按类型完成反馈或阅读确认。'
        : '向下属企业发布通知公告，任务型需附件反馈，通知型仅需确认阅读。';

    return (
        <>
            <Head title={pageTitle} />
            <div className="space-y-4 p-4">
                <header>
                    <h1 className="text-xl font-semibold text-slate-100">
                        {pageTitle}
                    </h1>
                    <p className="text-sm text-slate-400">{pageSubtitle}</p>
                </header>

                <nav className="flex gap-2 border-b border-blue-900/40">
                    <TabButton
                        active={tab === 'office'}
                        onClick={() => setTab('office')}
                    >
                        任务型
                    </TabButton>
                    <TabButton
                        active={tab === 'new'}
                        onClick={() => setTab('new')}
                    >
                        通知型
                    </TabButton>
                </nav>

                <NoticeTab key={tab} variant={tab} receiveOnly={receiveOnly} />
            </div>
        </>
    );
}

export default function ManagementNoticesIndex() {
    return <NoticesPage />;
}
