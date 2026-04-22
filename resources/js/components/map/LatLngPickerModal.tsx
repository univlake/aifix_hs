import L from 'leaflet';
import { MapPin, Search, X, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (Vite asset path issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LatLng {
    lat: number;
    lng: number;
}

interface SearchResult {
    name: string;
    lat: number;
    lng: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    value?: { lat?: number | string; lng?: number | string };
    onConfirm: (lat: number, lng: number) => void;
}

export function LatLngPickerModal({ open, onClose, value, onConfirm }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [selected, setSelected] = useState<LatLng | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const initLat = value?.lat ? Number(value.lat) : 39.9042;
    const initLng = value?.lng ? Number(value.lng) : 116.4074;

    const placeMarker = useCallback((lat: number, lng: number) => {
        if (!mapRef.current) {
            return;
        }

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
                mapRef.current,
            );
            markerRef.current.on('dragend', () => {
                const pos = markerRef.current!.getLatLng();
                setSelected({
                    lat: parseFloat(pos.lat.toFixed(6)),
                    lng: parseFloat(pos.lng.toFixed(6)),
                });
            });
        }

        setSelected({
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
        });
        mapRef.current.setView(
            [lat, lng],
            mapRef.current.getZoom() < 12 ? 14 : mapRef.current.getZoom(),
        );
    }, []);

    // Initialise map once the modal is open and the container is in the DOM
    useEffect(() => {
        if (!open) {
            return;
        }

        const timeout = setTimeout(() => {
            if (!containerRef.current || mapRef.current) {
                return;
            }

            const map = L.map(containerRef.current, {
                zoomControl: true,
            }).setView([initLat, initLng], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            map.on('click', (e) => {
                placeMarker(e.latlng.lat, e.latlng.lng);
            });

            mapRef.current = map;

            // Place initial marker if coordinates exist
            if (value?.lat && value?.lng) {
                placeMarker(Number(value.lat), Number(value.lng));
            }
        }, 80);

        return () => clearTimeout(timeout);
    }, [open]);

    // Cleanup on close
    useEffect(() => {
        if (!open && mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
            setResults([]);
            setSearchQuery('');
            setSelected(null);
        }
    }, [open]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            return;
        }

        setSearching(true);
        setResults([]);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&accept-language=zh`,
                { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } },
            );
            const data = await res.json();
            setResults(
                data.map((item: any) => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                })),
            );
        } catch {
            // silently fail
        } finally {
            setSearching(false);
        }
    };

    const handleConfirm = () => {
        if (!selected) {
            return;
        }

        onConfirm(selected.lat, selected.lng);
        onClose();
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0a1428] shadow-2xl shadow-black/50"
                style={{ height: '580px' }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-blue-900/40 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                            <MapPin className="h-4 w-4 text-blue-400" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-200">
                            选择坐标位置
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search bar */}
                <div className="shrink-0 border-b border-blue-900/30 px-4 py-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                            <input
                                type="text"
                                placeholder="搜索地址或地名..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-blue-900/50 bg-[#070d1f] py-2 pr-3 pl-9 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searching}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-600/30 bg-blue-600/20 px-3 py-2 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-600/30 disabled:opacity-50"
                        >
                            {searching ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Search className="h-3.5 w-3.5" />
                            )}
                            搜索
                        </button>
                    </form>

                    {/* Search results */}
                    {results.length > 0 && (
                        <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-blue-900/40 bg-[#070d1f]">
                            {results.map((r, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        placeMarker(r.lat, r.lng);
                                        setResults([]);
                                    }}
                                    className="w-full truncate border-b border-blue-900/20 px-3 py-2 text-left text-xs text-slate-400 transition-colors last:border-0 hover:bg-blue-600/10 hover:text-slate-200"
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="relative flex-1">
                    <div ref={containerRef} className="absolute inset-0" />
                    {!selected && (
                        <div className="pointer-events-none absolute inset-0 z-[400] flex items-end justify-center pb-6">
                            <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-sm">
                                点击地图选择位置
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between border-t border-blue-900/40 px-5 py-3.5">
                    <div className="text-xs text-slate-500">
                        {selected ? (
                            <span className="font-mono text-blue-400">
                                经度 {selected.lng} 纬度 {selected.lat}
                            </span>
                        ) : (
                            '未选择位置'
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-blue-900/40 px-4 py-2 text-xs text-slate-400 transition-colors hover:text-slate-200"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selected}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Check className="h-3.5 w-3.5" />
                            确认坐标
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
