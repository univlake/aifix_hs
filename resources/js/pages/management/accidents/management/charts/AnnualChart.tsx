import { Loader2 } from 'lucide-react';
import type { AnnualStat } from '../types';

const CHART_W = 800;
const CHART_H = 280;
const PAD = { top: 24, right: 24, bottom: 48, left: 56 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const SERIES = [
    {
        key: 'accident_count' as const,
        label: '事故数',
        color: '#3b82f6',
        shape: 'bar',
    },
    {
        key: 'hurt_count' as const,
        label: '受伤人数',
        color: '#f59e0b',
        shape: 'line',
    },
    {
        key: 'death_count' as const,
        label: '死亡人数',
        color: '#ef4444',
        shape: 'line',
    },
];

export function AnnualChart({
    data,
    loading,
}: {
    data: AnnualStat[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                暂无事故记录
            </div>
        );
    }

    const years = data.map((d) => d.year);
    const maxVal = Math.max(
        1,
        ...data.flatMap((d) => [d.accident_count, d.hurt_count, d.death_count]),
    );
    const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
    const gridLines = 5;

    const xStep = PLOT_W / Math.max(years.length, 1);
    const barW = Math.min(xStep * 0.4, 40);

    const toX = (i: number) => PAD.left + i * xStep + xStep / 2;
    const toY = (v: number) => PAD.top + PLOT_H - (v / niceMax) * PLOT_H;

    return (
        <div className="w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full"
                style={{ minWidth: 480 }}
            >
                {Array.from({ length: gridLines + 1 }, (_, i) => {
                    const y = PAD.top + (PLOT_H / gridLines) * i;
                    const val = Math.round(niceMax * (1 - i / gridLines));

                    return (
                        <g key={i}>
                            <line
                                x1={PAD.left}
                                y1={y}
                                x2={PAD.left + PLOT_W}
                                y2={y}
                                style={{ stroke: 'var(--border-subtle)' }}
                                strokeWidth="1"
                                strokeDasharray={
                                    i === gridLines ? 'none' : '4 3'
                                }
                            />
                            <text
                                x={PAD.left - 6}
                                y={y + 4}
                                textAnchor="end"
                                style={{ fill: 'var(--text-muted)' }}
                                fontSize="11"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {data.map((d, i) => {
                    const h = (d.accident_count / niceMax) * PLOT_H;
                    const cx = toX(i);

                    return (
                        <rect
                            key={d.year}
                            x={cx - barW / 2}
                            y={PAD.top + PLOT_H - h}
                            width={barW}
                            height={Math.max(h, 0)}
                            fill="#3b82f6"
                            fillOpacity="0.7"
                            rx="3"
                        />
                    );
                })}

                {(['hurt_count', 'death_count'] as const).map((key) => {
                    const color = SERIES.find((s) => s.key === key)!.color;
                    const pts = data
                        .map((d, i) => `${toX(i)},${toY(d[key])}`)
                        .join(' ');

                    return (
                        <g key={key}>
                            <polyline
                                points={pts}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {data.map((d, i) => (
                                <circle
                                    key={i}
                                    cx={toX(i)}
                                    cy={toY(d[key])}
                                    r="4"
                                    fill={color}
                                    style={{ stroke: 'var(--surface-card)' }}
                                    strokeWidth="1.5"
                                />
                            ))}
                        </g>
                    );
                })}

                {years.map((y, i) => (
                    <text
                        key={y}
                        x={toX(i)}
                        y={PAD.top + PLOT_H + 16}
                        textAnchor="middle"
                        style={{ fill: 'var(--text-muted)' }}
                        fontSize="12"
                    >
                        {y}
                    </text>
                ))}

                <line
                    x1={PAD.left}
                    y1={PAD.top + PLOT_H}
                    x2={PAD.left + PLOT_W}
                    y2={PAD.top + PLOT_H}
                    style={{ stroke: 'var(--text-muted)' }}
                    strokeWidth="1"
                />
            </svg>

            <div className="mt-3 flex items-center justify-center gap-6">
                {SERIES.map((s) => (
                    <div key={s.key} className="flex items-center gap-1.5">
                        {s.shape === 'bar' ? (
                            <span
                                className="inline-block h-3 w-4 rounded-sm"
                                style={{ background: s.color + '80' }}
                            />
                        ) : (
                            <span className="flex items-center gap-1">
                                <span
                                    className="inline-block h-0.5 w-4"
                                    style={{ background: s.color }}
                                />
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ background: s.color }}
                                />
                            </span>
                        )}
                        <span className="text-xs text-slate-400">
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
