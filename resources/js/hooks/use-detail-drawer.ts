import { useCallback, useState } from 'react';
import { useApiItem } from './use-api';

export interface UseDetailDrawerOptions {
    endpoint?: string;
    idKey?: string;
    prefetch?: boolean;
}

export function useDetailDrawer<T = Record<string, unknown>>(
    options: UseDetailDrawerOptions = {},
) {
    const { endpoint, idKey = 'id', prefetch = false } = options;

    const [open, setOpen] = useState(false);
    const [row, setRow] = useState<T | null>(null);

    // Always instantiated so the hook call order stays stable across renders.
    // Only issues a request when prefetch && endpoint are both truthy.
    const item = useApiItem<T>({ endpoint: endpoint ?? '' });
    const { fetch: fetchItem } = item;

    const openDetail = useCallback(
        (r: T) => {
            setRow(r);
            setOpen(true);

            if (prefetch && endpoint) {
                const id = (r as Record<string, unknown>)[idKey] as
                    | number
                    | string;
                void fetchItem(id);
            }
        },
        [prefetch, endpoint, idKey, fetchItem],
    );

    const close = useCallback(() => setOpen(false), []);

    const data = (prefetch ? item.data : row) as T | null;
    const loading = prefetch ? item.loading : false;
    const error = prefetch ? item.error : null;

    return {
        open,
        data,
        loading,
        error,
        openDetail,
        close,
        drawerProps: { open, data, onClose: close },
        triggerFor: (r: T) => ({
            onClick: () => openDetail(r),
            title: '详情',
        }),
    };
}
