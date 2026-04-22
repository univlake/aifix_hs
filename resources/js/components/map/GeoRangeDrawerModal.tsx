import L from 'leaflet';
import { Layers, X, Check, RotateCcw, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

type LatLngTuple = [number, number];

interface Props {
    open: boolean;
    onClose: () => void;
    center?: { lat?: number | string; lng?: number | string };
    value?: string; // JSON string of [[lat,lng], ...] polygon coords
    onConfirm: (coords: LatLngTuple[]) => void;
}

export function GeoRangeDrawerModal({
    open,
    onClose,
    center,
    value,
    onConfirm,
}: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const polygonRef = useRef<L.Polygon | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [hasPolygon, setHasPolygon] = useState(false);
    const [area, setArea] = useState<string>('');

    const centerLat = center?.lat ? Number(center.lat) : 39.9042;
    const centerLng = center?.lng ? Number(center.lng) : 116.4074;

    const clearPolygon = () => {
        if (polygonRef.current && mapRef.current) {
            mapRef.current.removeLayer(polygonRef.current);
            polygonRef.current = null;
        }

        setHasPolygon(false);
        setArea('');
    };

    const drawPolygon = (coords: LatLngTuple[]) => {
        if (!mapRef.current || coords.length < 3) {
            return;
        }

        clearPolygon();

        const polygon = L.polygon(coords, {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(mapRef.current);

        polygonRef.current = polygon;
        setHasPolygon(true);

        // Rough area calculation in m²
        const latlngs = coords.map(([lat, lng]) => L.latLng(lat, lng));
        const approxArea = calculatePolygonArea(latlngs);
        setArea(formatArea(approxArea));

        mapRef.current.fitBounds(polygon.getBounds(), { padding: [40, 40] });
    };

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
            }).setView([centerLat, centerLng], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Enable Geoman drawing tools — polygon only
            map.pm.addControls({
                position: 'topleft',
                drawMarker: false,
                drawCircle: false,
                drawCircleMarker: false,
                drawPolyline: false,
                drawRectangle: true,
                drawPolygon: true,
                drawText: false,
                editMode: true,
                dragMode: false,
                cutPolygon: false,
                removalMode: true,
                rotateMode: false,
            });

            // Geoman dark theme hint — apply via CSS override
            map.pm.setGlobalOptions({ continueDrawing: false });

            // When a new layer is drawn
            map.on('pm:create', (e: any) => {
                // Remove previous polygon
                if (polygonRef.current) {
                    map.removeLayer(polygonRef.current);
                    polygonRef.current = null;
                }

                const layer = e.layer as L.Polygon;

                // Style it consistently
                layer.setStyle({
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 2,
                });

                polygonRef.current = layer;
                setHasPolygon(true);

                const latlngs = layer.getLatLngs()[0] as L.LatLng[];
                const approxArea = calculatePolygonArea(latlngs);
                setArea(formatArea(approxArea));
            });

            // When a layer is removed
            map.on('pm:remove', () => {
                polygonRef.current = null;
                setHasPolygon(false);
                setArea('');
            });

            mapRef.current = map;

            // Restore existing polygon if any
            if (value) {
                try {
                    const coords: LatLngTuple[] = JSON.parse(value);

                    if (Array.isArray(coords) && coords.length >= 3) {
                        drawPolygon(coords);
                    }
                } catch {
                    // ignore invalid stored value
                }
            }
        }, 80);

        return () => clearTimeout(timeout);
    }, [open]);

    // Cleanup
    useEffect(() => {
        if (!open && mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            polygonRef.current = null;
            setHasPolygon(false);
            setArea('');
        }
    }, [open]);

    const handleConfirm = () => {
        if (!polygonRef.current) {
            return;
        }

        const latlngs = polygonRef.current.getLatLngs()[0] as L.LatLng[];
        const coords: LatLngTuple[] = latlngs.map((ll) => [
            parseFloat(ll.lat.toFixed(6)),
            parseFloat(ll.lng.toFixed(6)),
        ]);
        onConfirm(coords);
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
                className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0a1428] shadow-2xl shadow-black/50"
                style={{ height: '600px' }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-blue-900/40 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                            <Layers className="h-4 w-4 text-blue-400" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-200">
                            绘制企业地理范围
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tip bar */}
                <div className="flex shrink-0 items-center gap-2 border-b border-blue-900/30 bg-blue-600/5 px-5 py-2.5">
                    <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <p className="text-xs text-slate-500">
                        使用左侧工具栏中的{' '}
                        <span className="text-blue-400">多边形</span> 或{' '}
                        <span className="text-blue-400">矩形</span>{' '}
                        工具在地图上绘制企业范围，完成后点击确认。
                    </p>
                    {hasPolygon && (
                        <button
                            onClick={clearPolygon}
                            className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-red-500/30 bg-red-600/10 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-600/20"
                        >
                            <RotateCcw className="h-3 w-3" />
                            清除
                        </button>
                    )}
                </div>

                {/* Map */}
                <div className="relative flex-1">
                    <div ref={containerRef} className="absolute inset-0" />
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between border-t border-blue-900/40 px-5 py-3.5">
                    <div className="text-xs text-slate-500">
                        {hasPolygon && area ? (
                            <span className="text-emerald-400">
                                已绘制区域 · 约 {area}
                            </span>
                        ) : (
                            '未绘制范围'
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
                            disabled={!hasPolygon}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Check className="h-3.5 w-3.5" />
                            确认范围
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────

/** Shoelace formula approximation in square metres (flat-earth, good enough for small areas) */
function calculatePolygonArea(points: L.LatLng[]): number {
    if (points.length < 3) {
        return 0;
    }

    let area = 0;
    const n = points.length;
    const R = 6371000; // Earth radius in metres

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi =
            ((points[i].lng * Math.PI) / 180) *
            R *
            Math.cos((points[i].lat * Math.PI) / 180);
        const yi = ((points[i].lat * Math.PI) / 180) * R;
        const xj =
            ((points[j].lng * Math.PI) / 180) *
            R *
            Math.cos((points[j].lat * Math.PI) / 180);
        const yj = ((points[j].lat * Math.PI) / 180) * R;
        area += xi * yj - xj * yi;
    }

    return Math.abs(area / 2);
}

function formatArea(sqm: number): string {
    if (sqm >= 1_000_000) {
        return `${(sqm / 1_000_000).toFixed(2)} km²`;
    }

    if (sqm >= 10_000) {
        return `${(sqm / 10_000).toFixed(2)} 公顷`;
    }

    return `${Math.round(sqm)} m²`;
}
