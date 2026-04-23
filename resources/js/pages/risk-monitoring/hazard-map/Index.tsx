import { Head } from '@inertiajs/react';
import L from 'leaflet';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import api from '@/lib/api';
import 'leaflet/dist/leaflet.css';
import {
    AlertTriangle,
    Building2,
    Loader2,
    RefreshCw,
    X,
    ShieldAlert,
} from 'lucide-react';

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
    hazards?: MajorHazard[];
    hazardCount?: number;
}

interface MajorHazard {
    id: number;
    name: string;
    level?: string;
    position?: string;
    r_value?: string | number;
    company_id: number;
}

const LEVEL_COLORS: Record<string, string> = {
    一级: '#ef4444',
    二级: '#f97316',
    三级: '#eab308',
    四级: '#3b82f6',
};

const levelColor = (level?: string): string => {
    if (!level) {
        return '#7c3aed';
    }

    return LEVEL_COLORS[level.trim()] ?? '#7c3aed';
};

function createHazardIcon(level?: string, count = 0, active = false) {
    const color = levelColor(level);
    const size = active ? 36 : 28;
    const label =
        count > 1
            ? `<text x="${size / 2}" y="${size / 2 + 4}" font-size="${size * 0.35}" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${count}</text>`
            : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <polygon points="${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}" fill="${color}" fill-opacity="${active ? 1 : 0.88}"/>
        ${count > 1 ? label : `<circle cx="${size / 2}" cy="${size / 2 + 4}" r="4" fill="white" fill-opacity="0.9"/>`}
    </svg>`;

    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

function createCompanyIcon(active = false) {
    const size = active ? 30 : 22;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.28}" viewBox="0 0 ${size} ${size * 1.28}">
        <path d="M${size / 2} 0C${size * 0.232} 0 0 ${size * 0.232} 0 ${size / 2}c0 ${size * 0.375} ${size / 2} ${size * 0.786} ${size / 2} ${size * 0.786}S${size} ${size * 0.875} ${size} ${size / 2}C${size} ${size * 0.232} ${size * 0.768} 0 ${size / 2} 0z" fill="#475569" fill-opacity="${active ? 1 : 0.7}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.22}" fill="white" fill-opacity="0.9"/>
    </svg>`;

    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [size, size * 1.28],
        iconAnchor: [size / 2, size * 1.28],
        popupAnchor: [0, -size * 1.28],
    });
}

export default function HazardMap() {
    const { rootCompany } = useScope();
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());

    const [companies, setCompanies] = useState<MapCompany[]>([]);
    const [allHazards, setAllHazards] = useState<MajorHazard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<MapCompany | null>(null);

    const fetchData = useCallback(() => {
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
            api.get('/major-hazards', {
                params: { company_id: rootCompany.id, per_page: 200 },
            }),
        ])
            .then(([rootRes, listRes, hazardRes]) => {
                const root: MapCompany = rootRes.data.data;
                const subs: MapCompany[] = listRes.data.data?.data ?? [];
                const hazards: MajorHazard[] = hazardRes.data.data?.data ?? [];
                setAllHazards(hazards);

                // Attach hazard counts to companies
                const hazardsByCompany = new Map<number, MajorHazard[]>();
                hazards.forEach((h) => {
                    const list = hazardsByCompany.get(h.company_id) ?? [];
                    list.push(h);
                    hazardsByCompany.set(h.company_id, list);
                });

                const all = [root, ...subs].map((c) => ({
                    ...c,
                    hazards: hazardsByCompany.get(c.id) ?? [],
                    hazardCount: hazardsByCompany.get(c.id)?.length ?? 0,
                }));
                setCompanies(all);
            })
            .catch(() => setError('加载数据失败'))
            .finally(() => setLoading(false));
    }, [rootCompany?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Init map
    useEffect(() => {
        if (loading || !containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current).setView([35.86, 104.19], 5);
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

    // Add markers
    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();

        const withCoords = companies.filter((c) => c.longitude && c.dimension);
        withCoords.forEach((c) => {
            const lat = Number(c.dimension);
            const lng = Number(c.longitude);

            if (isNaN(lat) || isNaN(lng)) {
                return;
            }

            const hasHazards = (c.hazardCount ?? 0) > 0;
            const topLevel = c.hazards?.[0]?.level;
            const icon = hasHazards
                ? createHazardIcon(
                      topLevel,
                      c.hazardCount,
                      selected?.id === c.id,
                  )
                : createCompanyIcon(selected?.id === c.id);

            const marker = L.marker([lat, lng], { icon }).addTo(map);
            marker.on('click', () => setSelected(c));
            markersRef.current.set(c.id, marker);
        });

        if (withCoords.length > 0 && markersRef.current.size > 0) {
            const group = L.featureGroup(
                Array.from(markersRef.current.values()),
            );
            map.fitBounds(group.getBounds().pad(0.25));
        }
    }, [companies, mapRef.current]);

    // Refresh icons on selection
    useEffect(() => {
        markersRef.current.forEach((m, id) => {
            const c = companies.find((x) => x.id === id);

            if (!c) {
                return;
            }

            const hasHazards = (c.hazardCount ?? 0) > 0;
            const topLevel = c.hazards?.[0]?.level;
            m.setIcon(
                hasHazards
                    ? createHazardIcon(
                          topLevel,
                          c.hazardCount,
                          selected?.id === id,
                      )
                    : createCompanyIcon(selected?.id === id),
            );
        });
    }, [selected]);

    const hazardCompanies = companies.filter((c) => (c.hazardCount ?? 0) > 0);

    return (
        <>
            <Head title="重大危险源分布图" />

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        重大危险源分布图
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        标注辖区内各企业重大危险源的地理位置与风险等级
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                    />
                    刷新
                </button>
            </div>

            {/* Stats */}
            <div className="mb-4 flex items-center gap-5 text-xs">
                <span className="text-slate-500">
                    重大危险源{' '}
                    <span className="font-semibold text-amber-400">
                        {allHazards.length}
                    </span>{' '}
                    处
                </span>
                <span className="text-slate-500">
                    涉及企业{' '}
                    <span className="font-semibold text-slate-300">
                        {hazardCompanies.length}
                    </span>{' '}
                    家
                </span>
                {[1, 2, 3, 4].map((lvl) => {
                    const key = `${lvl}级` as keyof typeof LEVEL_COLORS;
                    const count = allHazards.filter(
                        (h) => h.level === `${lvl}级`,
                    ).length;

                    if (!count) {
                        return null;
                    }

                    return (
                        <span
                            key={lvl}
                            className="flex items-center gap-1 text-slate-500"
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor:
                                        LEVEL_COLORS[key] ?? '#475569',
                                }}
                            />
                            {lvl}级 {count} 处
                        </span>
                    );
                })}
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {/* Map */}
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
                        <div className="space-y-2">
                            {[
                                {
                                    label: '一级危险源',
                                    color: '#ef4444',
                                    shape: 'triangle',
                                },
                                {
                                    label: '二级危险源',
                                    color: '#f97316',
                                    shape: 'triangle',
                                },
                                {
                                    label: '三级危险源',
                                    color: '#eab308',
                                    shape: 'triangle',
                                },
                                {
                                    label: '四级危险源',
                                    color: '#3b82f6',
                                    shape: 'triangle',
                                },
                                {
                                    label: '无危险源企业',
                                    color: '#475569',
                                    shape: 'circle',
                                },
                            ].map(({ label, color, shape }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2.5"
                                >
                                    {shape === 'triangle' ? (
                                        <svg width="12" height="12">
                                            <polygon
                                                points="6,0 12,12 0,12"
                                                fill={color}
                                            />
                                        </svg>
                                    ) : (
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                    )}
                                    <span className="text-xs text-slate-400">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected company hazards */}
                    {selected && (
                        <div className="rounded-xl border border-amber-900/20 bg-[#0d1530] p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-600/20 bg-amber-600/10">
                                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    <p className="text-xs leading-snug font-medium text-slate-200">
                                        {selected.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="text-slate-600 transition-colors hover:text-slate-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            {(selected.hazardCount ?? 0) === 0 ? (
                                <p className="text-xs text-slate-600">
                                    该企业暂无重大危险源
                                </p>
                            ) : (
                                <div className="max-h-52 space-y-1.5 overflow-y-auto">
                                    {selected.hazards?.map((h) => (
                                        <div
                                            key={h.id}
                                            className="flex items-start gap-2 rounded-lg border border-blue-900/20 bg-[#070d1f]/60 px-3 py-2"
                                        >
                                            {h.level && (
                                                <span
                                                    className="mt-px shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                                    style={{
                                                        backgroundColor: `${levelColor(h.level)}20`,
                                                        color: levelColor(
                                                            h.level,
                                                        ),
                                                    }}
                                                >
                                                    {h.level}
                                                </span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-slate-300">
                                                    {h.name}
                                                </p>
                                                {h.position && (
                                                    <p className="text-[10px] text-slate-600">
                                                        {h.position}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hazard summary list */}
                    {!selected && hazardCompanies.length > 0 && (
                        <div className="rounded-xl border border-blue-900/40 bg-[#0d1530] p-4">
                            <p className="mb-3 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                                含危险源企业
                            </p>
                            <div className="max-h-56 space-y-1.5 overflow-y-auto">
                                {hazardCompanies.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelected(c)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-blue-600/10"
                                    >
                                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                                        <span className="flex-1 truncate text-slate-400">
                                            {c.title}
                                        </span>
                                        <span className="shrink-0 rounded bg-amber-600/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                                            {c.hazardCount}处
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
