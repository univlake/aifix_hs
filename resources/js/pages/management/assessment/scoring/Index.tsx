import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AccidentTab } from './tabs/AccidentTab';
import { DailyTab } from './tabs/DailyTab';
import { NormTab } from './tabs/NormTab';
import { PointsTab } from './tabs/PointsTab';
import { SystemTab } from './tabs/SystemTab';
import { TABS, type TabKey } from './types';

export default function AssessmentScoringIndex() {
    const [tab, setTab] = useState<TabKey>('daily');

    return (
        <>
            <Head title="考核评分" />
            <div className="space-y-4 p-4">
                <header className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-600/15">
                        <Trophy className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-100">
                            考核评分
                        </h1>
                        <p className="text-sm text-slate-400">
                            对所辖下级企业在日常目标管理工作、大中型企业安全生产标准化管理体系构建
                            、活动参与及材料上报情况 、安全
                            生产安全生产事故考核指标指标
                            、加分项五个维度进行量化评分。
                        </p>
                    </div>
                </header>

                <nav className="flex gap-2 border-b border-blue-900/40">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'relative -mb-px px-4 py-2 text-sm transition-colors',
                                tab === t.key
                                    ? 'border-b-2 border-blue-400 text-slate-100'
                                    : 'text-slate-500 hover:text-slate-300',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                {tab === 'daily' && <DailyTab />}
                {tab === 'accident' && <AccidentTab />}
                {tab === 'points' && <PointsTab />}
                {tab === 'norm' && <NormTab />}
                {tab === 'system' && <SystemTab />}
            </div>
        </>
    );
}
