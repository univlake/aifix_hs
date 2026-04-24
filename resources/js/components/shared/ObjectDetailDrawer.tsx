import { X } from 'lucide-react';
import { AttachmentViewer } from '@/components/shared/AttachmentViewer';

type DetailValue = unknown;

interface ObjectDetailDrawerProps {
    open: boolean;
    title: string;
    data: Record<string, DetailValue> | null | undefined;
    onClose: () => void;
    labels?: Record<string, string>;
    hiddenKeys?: string[];
}

const preferredDisplayKeys = [
    'title',
    'name',
    'equipment_name',
    'qualification_name',
];

function isUrl(value: string): boolean {
    return /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(value);
}

function isAttachmentField(fieldKey?: string): boolean {
    if (!fieldKey) {
        return false;
    }

    return (
        fieldKey.endsWith('_url') ||
        fieldKey.includes('annex') ||
        fieldKey.includes('attachment')
    );
}

function renderAttachmentLink(value: string): React.ReactNode {
    return <AttachmentViewer url={value} label="查看附件" />;
}

function renderValue(
    value: DetailValue,
    labels: Record<string, string>,
    hiddenKeys: Set<string>,
    fieldKey?: string,
): React.ReactNode {
    if (value === null || value === undefined || value === '') {
        return <p className="text-sm text-slate-600">—</p>;
    }

    if (typeof value === 'string') {
        if (isAttachmentField(fieldKey)) {
            return renderAttachmentLink(value);
        }

        if (isUrl(value)) {
            return renderAttachmentLink(value);
        }

        return (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                {value}
            </p>
        );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return <p className="text-sm text-slate-300">{String(value)}</p>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <p className="text-sm text-slate-600">—</p>;
        }

        return (
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-blue-900/30 bg-[#0b1226] p-3"
                    >
                        {typeof item === 'object' && item !== null
                            ? renderObjectValue(
                                  item as Record<string, DetailValue>,
                                  labels,
                                  hiddenKeys,
                              )
                            : renderValue(item, labels, hiddenKeys, fieldKey)}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof value === 'object') {
        return renderObjectValue(
            value as Record<string, DetailValue>,
            labels,
            hiddenKeys,
        );
    }

    return <p className="text-sm text-slate-300">{String(value)}</p>;
}

function renderObjectValue(
    value: Record<string, DetailValue>,
    labels: Record<string, string>,
    hiddenKeys: Set<string>,
): React.ReactNode {
    const visibleEntries = Object.entries(value).filter(
        ([key, nestedValue]) => {
            if (hiddenKeys.has(key) || key.endsWith('_id')) {
                return false;
            }

            return (
                nestedValue !== null &&
                nestedValue !== undefined &&
                nestedValue !== ''
            );
        },
    );

    const displayEntry = visibleEntries.find(([key]) =>
        preferredDisplayKeys.includes(key),
    );

    if (displayEntry && visibleEntries.length === 1) {
        return renderValue(displayEntry[1], labels, hiddenKeys);
    }

    return (
        <div className="space-y-2 rounded-lg border border-blue-900/30 bg-[#0b1226] p-3">
            {visibleEntries.map(([key, nestedValue]) => (
                <div key={key}>
                    <p className="text-xs text-slate-500">
                        {labels[key] ?? key}
                    </p>
                    <div className="mt-1">
                        {renderValue(nestedValue, labels, hiddenKeys, key)}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ObjectDetailDrawer({
    open,
    title,
    data,
    onClose,
    labels = {},
    hiddenKeys = [],
}: ObjectDetailDrawerProps) {
    if (!open || !data) {
        return null;
    }

    const hiddenKeySet = new Set([
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
        ...hiddenKeys,
    ]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-blue-900/40 bg-[#070d1f] shadow-2xl">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            仅展示记录信息
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {Object.entries(data)
                            .filter(
                                ([key]) =>
                                    !hiddenKeySet.has(key) &&
                                    !key.endsWith('_id'),
                            )
                            .map(([key, value]) => (
                                <div key={key}>
                                    <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        {labels[key] ?? key}
                                    </p>
                                    {renderValue(
                                        value,
                                        labels,
                                        hiddenKeySet,
                                        key,
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
