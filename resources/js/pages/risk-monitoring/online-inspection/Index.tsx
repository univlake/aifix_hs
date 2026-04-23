import { Head } from '@inertiajs/react';
import { RefreshCw, UserX, Wrench, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface AlertCounts {
    expired_staff_certs: number;
    expired_equipment: number;
    unrevised_hazards: number;
}

export default function OnlineInspection() {
    const { activeCompany } = useScope();
    const [alerts, setAlerts] = useState<AlertCounts>({
        expired_staff_certs: 0,
        expired_equipment: 0,
        unrevised_hazards: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchAlerts = () => {
        if (!activeCompany?.id) {
            return;
        }

        setLoading(true);
        api.get('/inspection-alerts', {
            params: { company_id: activeCompany.id },
        })
            .then((res) => setAlerts(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAlerts();
    }, [activeCompany?.id]);

    const STATS = [
        {
            icon: UserX,
            label: '过期人员证书',
            desc: '特种作业人员证件已超有效期',
            value: alerts.expired_staff_certs,
            color: 'red',
        },
        {
            icon: Wrench,
            label: '过期特种设备',
            desc: '特种设备检验有效期已过期',
            value: alerts.expired_equipment,
            color: 'orange',
        },
        {
            icon: ShieldAlert,
            label: '未整改隐患',
            desc: '月度排查中尚未完成整改项',
            value: alerts.unrevised_hazards,
            color: 'amber',
        },
    ] as const;

    return (
        <>
            <Head title="在线巡检" />

            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        在线巡检
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        统计下属企业过期证书、设备及未整改隐患预警情况
                    </p>
                </div>
                <button
                    onClick={fetchAlerts}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-50"
                >
                    <RefreshCw
                        className={cn('h-3.5 w-3.5', loading && 'animate-spin')}
                    />
                    刷新
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {STATS.map(({ icon: Icon, label, desc, value, color }) => (
                    <div
                        key={label}
                        className={cn(
                            'rounded-xl border p-6',
                            color === 'red' &&
                                'border-red-500/20 bg-red-950/10',
                            color === 'orange' &&
                                'border-orange-500/20 bg-orange-950/10',
                            color === 'amber' &&
                                'border-amber-500/20 bg-amber-950/10',
                        )}
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                                    color === 'red' &&
                                        'border-red-600/20 bg-red-600/10 text-red-400',
                                    color === 'orange' &&
                                        'border-orange-600/20 bg-orange-600/10 text-orange-400',
                                    color === 'amber' &&
                                        'border-amber-600/20 bg-amber-600/10 text-amber-400',
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-200">
                                    {label}
                                </p>
                                <p className="text-xs text-slate-500">{desc}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-800" />
                        ) : (
                            <p
                                className={cn(
                                    'text-4xl font-bold',
                                    value > 0
                                        ? color === 'red'
                                            ? 'text-red-400'
                                            : color === 'orange'
                                              ? 'text-orange-400'
                                              : 'text-amber-400'
                                        : 'text-slate-600',
                                )}
                            >
                                {value}
                                <span
                                    className={cn(
                                        'ml-1.5 text-sm font-normal',
                                        value > 0
                                            ? 'opacity-70'
                                            : 'text-slate-700',
                                    )}
                                >
                                    项
                                </span>
                            </p>
                        )}

                        {!loading && value === 0 && (
                            <p className="mt-1 text-xs text-slate-700">
                                暂无异常
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
