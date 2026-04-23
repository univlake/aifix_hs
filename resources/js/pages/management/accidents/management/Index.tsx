import { Head } from '@inertiajs/react';
import { Activity, List } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/models';
import { AccidentList } from './AccidentList';
import { AnnualChart } from './charts/AnnualChart';
import type { AnnualStat } from './types';

type Tab = 'chart' | 'list';

export default function AccidentManagementIndex() {
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [activeTab, setActiveTab] = useState<Tab>('chart');
    const [chartData, setChartData] = useState<AnnualStat[]>([]);
    const [chartLoading, setChartLoading] = useState(false);

    const prevCompanyId = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!companyId || companyId === prevCompanyId.current) {
            return;
        }

        prevCompanyId.current = companyId;
        queueMicrotask(() => setChartLoading(true));
        api.get<ApiResponse<AnnualStat[]>>(
            '/bloc-accident-bulletins/annual-stats',
            {
                params: { company_id: companyId },
            },
        )
            .then((res) => setChartData(res.data.data))
            .catch(() => setChartData([]))
            .finally(() => setChartLoading(false));
    }, [companyId]);

    const TABS = useMemo(
        () => [
            { key: 'chart' as Tab, label: '年度曲线图', icon: Activity },
            { key: 'list' as Tab, label: '事故列表', icon: List },
        ],
        [],
    );

    return (
        <>
            <Head title="事故应急管理" />

            <div className="-mx-6 -mt-6 mb-6 flex items-center gap-0.5 border-b border-slate-800/80 px-6">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === key
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'chart' && (
                <div>
                    <div className="mb-4">
                        <h1 className="text-lg font-semibold text-slate-100">
                            事故年度趋势
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-600">
                            当前企业及下属企业历年事故数、受伤人数、死亡人数汇总
                        </p>
                    </div>

                    {!chartLoading && chartData.length > 0 && (
                        <SummaryCards data={chartData} />
                    )}

                    <div className="rounded-xl border border-blue-900/30 bg-[#0d1530]/60 p-5">
                        <AnnualChart data={chartData} loading={chartLoading} />
                    </div>
                </div>
            )}

            {activeTab === 'list' && <AccidentList companyId={companyId} />}
        </>
    );
}

function SummaryCards({ data }: { data: AnnualStat[] }) {
    const total_accidents = data.reduce(
        (s, d) => s + (d.accident_count ?? 0),
        0,
    );
    const total_hurt = data.reduce((s, d) => s + (d.hurt_count ?? 0), 0);
    const total_death = data.reduce((s, d) => s + (d.death_count ?? 0), 0);

    const cards = [
        { label: '累计事故', value: total_accidents, color: 'text-blue-400' },
        { label: '累计受伤', value: total_hurt, color: 'text-amber-400' },
        { label: '累计死亡', value: total_death, color: 'text-red-400' },
    ];

    return (
        <div className="mb-6 grid grid-cols-3 gap-4">
            {cards.map(({ label, value, color }) => (
                <div
                    key={label}
                    className="rounded-xl border border-blue-900/30 bg-[#0d1530]/60 p-4"
                >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`mt-1 text-2xl font-bold ${color}`}>
                        {value}
                    </p>
                </div>
            ))}
        </div>
    );
}
