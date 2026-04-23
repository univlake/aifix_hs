import { Head } from '@inertiajs/react';
import L from 'leaflet';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { Building2, AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapCompany {
    id: number;
    title: string;
    address?: string;
    longitude?: string | number;
    dimension?: string | number;
    status: number;
    status_str: string;
    inherent_risk_grade?: string;
    float_risk_grade?: string;
    enterprise_type?: { title: string };
}

type ColorMode = 'status' | 'risk';

const riskGradeColor = (grade?: string): string => {
    if (!grade) {
        return '#475569';
    }

    const g = grade.trim();

    if (g.includes('红') || g === '一级' || g === '1') {
        return '#ef4444';
    }

    if (g.includes('橙') || g === '二级' || g === '2') {
        return '#f97316';
    }

    if (g.includes('黄') || g === '三级' || g === '3') {
        return '#eab308';
    }

    if (g.includes('蓝') || g === '四级' || g === '4') {
        return '#3b82f6';
    }

    return '#475569';
};

const statusColor = (status: number): string => {
    if (status === 1) {
        return '#10b981';
    }

    if (status === 0) {
        return '#f59e0b';
    }

    return '#475569';
};

function createPinIcon(color: string, active = false) {
    const size = active ? 34 : 26;
    const dotR = active ? 8 : 6;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}" viewBox="0 0 ${size} ${size * 1.3}">
        <path d="M${size / 2} 0C${size * 0.232} 0 0 ${size * 0.232} 0 ${size / 2}c0 ${size * 0.375} ${size / 2} ${size * 0.786} ${size / 2} ${size * 0.786}S${size} ${size * 0.875} ${size} ${size / 2}C${size} ${size * 0.232} ${size * 0.768} 0 ${size / 2} 0z" fill="${color}" fill-opacity="${active ? 1 : 0.85}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${dotR}" fill="white" fill-opacity="0.92"/>
    </svg>`;

    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [size, size * 1.3],
        iconAnchor: [size / 2, size * 1.3],
        popupAnchor: [0, -size * 1.3],
    });
}

export default function EnterpriseMap() {
    const { rootCompany } = useScope();
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());

    const [companies, setCompanies] = useState<MapCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<MapCompany | null>(null);
    const [colorMode, setColorMode] = useState<ColorMode>('status');

    const fetchCompanies = useCallback(() => {
        if (!rootCompany?.id) {
            return;
        }

        setLoading(true);
        setError('');
        Promise.all([
            api.get(`/companies/${rootCompany.id}`),
            api.get('/companies', {
                params: { pid: rootCompany.id, per_page: 200 },
            }),
        ])
            .then(([rootRes, listRes]) => {
                const root: MapCompany = rootRes.data.data;
                const subs: MapCompany[] = listRes.data.data?.data ?? [];
                setCompanies([root, ...subs]);
            })
            .catch(() => setError('加载企业数据失败'))
            .finally(() => setLoading(false));
    }, [rootCompany?.id]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Init map after data loads
    useEffect(() => {
        if (loading || !containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current, { zoomControl: true }).setView(
            [35.86, 104.19],
            5,
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markersRef.current.clear();
        };
    }, [loading]);

    // Add / update markers
    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        // Remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();

        const withCoords = companies.filter((c) => c.longitude && c.dimension);

        withCoords.forEach((c) => {
            const lat = Number(c.dimension);
            const lng = Number(c.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                return;
            }

            const color =
                colorMode === 'risk'
                    ? riskGradeColor(
                          c.float_risk_grade ?? c.inherent_risk_grade,
                      )
                    : statusColor(c.status);

            const marker = L.marker([lat, lng], {
                icon: createPinIcon(color),
            }).addTo(map);
            marker.on('click', () => {
                setSelected(c);
            });
            markersRef.current.set(c.id, marker);
        });

        if (withCoords.length > 0 && markersRef.current.size > 0) {
            const group = L.featureGroup(
                Array.from(markersRef.current.values()),
            );
            map.fitBounds(group.getBounds().pad(0.25));
        }
    }, [companies, colorMode, mapRef.current]);

    // Highlight selected marker
    useEffect(() => {
        markersRef.current.forEach((m, id) => {
            const c = companies.find((x) => x.id === id);

            if (!c) {
                return;
            }

            const color =
                colorMode === 'risk'
                    ? riskGradeColor(
                          c.float_risk_grade ?? c.inherent_risk_grade,
                      )
                    : statusColor(c.status);
            m.setIcon(createPinIcon(color, selected?.id === id));
        });
    }, [selected]);

    const withCoords = companies.filter((c) => c.longitude && c.dimension);
    const noCoords = companies.filter((c) => !c.longitude || !c.dimension);

    return (
        <>
            <Head title="企业分布图" />

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        企业分布图
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        辖区内企业的地理位置可视化
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-blue-900/40 bg-[#0a1428] p-1 text-xs">
                        {(['status', 'risk'] as ColorMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setColorMode(m)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 font-medium transition-all',
                                    colorMode === m
                                        ? 'bg-blue-600/30 text-blue-300'
                                        : 'text-slate-500 hover:text-slate-300',
                                )}
                            >
                                {m === 'status' ? '按状态着色' : '按风险着色'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchCompanies}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={cn(
                                'h-3.5 w-3.5',
                                loading && 'animate-spin',
                            )}
                        />
                        刷新
                    </button>
                </div>
            </div>

            {/* Stats strip */}
            <div className="mb-4 flex items-center gap-5 text-xs">
                <span className="text-slate-500">
                    共{' '}
                    <span className="font-semibold text-slate-300">
                        {companies.length}
                    </span>{' '}
                    家企业
                </span>
                <span className="text-slate-500">
                    已标注坐标{' '}
                    <span className="font-semibold text-blue-400">
                        {withCoords.length}
                    </span>{' '}
                    家
                </span>
                {noCoords.length > 0 && (
                    <span className="text-slate-600">
                        未设坐标{' '}
                        <span className="font-semibold">{noCoords.length}</span>{' '}
                        家（不显示在地图）
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {/* Map panel */}
                <div className="lg:col-span-3">
                    <div
                        className="relative overflow-hidden rounded-xl border border-blue-900/40"
                        style={{ height: 560 }}
                    >
                        {loading ? (
                            <div className="flex h-full items-center justify-center bg-[#0d1530]">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500/40" />
                            </div>
                        ) : (
                            <div ref={containerRef} className="h-full w-full" />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-3">
                    {/* Legend */}
                    <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-4">
                        <p className="mb-3 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                            图例
                        </p>
                        {colorMode === 'status' ? (
                            <div className="space-y-2">
                                {[
                                    { color: '#10b981', label: '正常运营' },
                                    { color: '#f59e0b', label: '待审核' },
                                    { color: '#475569', label: '已停用' },
                                ].map(({ color, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2.5"
                                    >
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-xs text-slate-400">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {[
                                    {
                                        color: '#ef4444',
                                        label: '一级/红色风险',
                                    },
                                    {
                                        color: '#f97316',
                                        label: '二级/橙色风险',
                                    },
                                    {
                                        color: '#eab308',
                                        label: '三级/黄色风险',
                                    },
                                    {
                                        color: '#3b82f6',
                                        label: '四级/蓝色风险',
                                    },
                                    { color: '#475569', label: '未评级' },
                                ].map(({ color, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2.5"
                                    >
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-xs text-slate-400">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected company detail */}
                    {selected && (
                        <div className="rounded-xl border border-blue-500/25 bg-blue-600/5 p-4">
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                                    </div>
                                    <p className="text-sm leading-snug font-medium text-slate-200">
                                        {selected.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="shrink-0 text-slate-600 transition-colors hover:text-slate-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <dl className="space-y-1.5 text-xs">
                                {selected.enterprise_type?.title && (
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-600">
                                            类型
                                        </dt>
                                        <dd className="text-slate-400">
                                            {selected.enterprise_type.title}
                                        </dd>
                                    </div>
                                )}
                                {selected.address && (
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-600">
                                            地址
                                        </dt>
                                        <dd className="leading-relaxed text-slate-400">
                                            {selected.address}
                                        </dd>
                                    </div>
                                )}
                                {selected.inherent_risk_grade && (
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-600">
                                            固有风险
                                        </dt>
                                        <dd className="text-slate-300">
                                            {selected.inherent_risk_grade}
                                        </dd>
                                    </div>
                                )}
                                {selected.float_risk_grade && (
                                    <div className="flex gap-2">
                                        <dt className="w-16 shrink-0 text-slate-600">
                                            浮动风险
                                        </dt>
                                        <dd className="text-slate-300">
                                            {selected.float_risk_grade}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <dt className="w-16 shrink-0 text-slate-600">
                                        坐标
                                    </dt>
                                    <dd className="font-mono text-slate-500">
                                        {Number(selected.longitude).toFixed(5)}
                                        ,&nbsp;
                                        {Number(selected.dimension).toFixed(5)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    {/* No-coord list */}
                    {noCoords.length > 0 && (
                        <div className="rounded-xl border border-amber-900/20 bg-[#0d1530] p-4">
                            <p className="mb-2 text-[10px] font-semibold tracking-wider text-amber-500/60 uppercase">
                                未设坐标企业
                            </p>
                            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                                {noCoords.map((c) => (
                                    <p
                                        key={c.id}
                                        className="truncate text-xs text-slate-600"
                                    >
                                        {c.title}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
