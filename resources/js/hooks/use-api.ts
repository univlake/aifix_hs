import { useState, useCallback, useRef, useEffect } from 'react';
import api from '@/lib/api';
import type { ApiResponse, PaginatedData } from '@/types/models';

interface UseApiListOptions {
    endpoint: string;
    defaultPerPage?: number;
    defaultParams?: Record<string, unknown>;
}

interface ListState<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export function useApiList<T = Record<string, unknown>>({
    endpoint,
    defaultPerPage = 15,
    defaultParams = {},
}: UseApiListOptions) {
    const [state, setState] = useState<ListState<T>>({
        data: [],
        loading: true,
        error: null,
        current_page: 1,
        last_page: 1,
        per_page: defaultPerPage,
        total: 0,
    });
    const [page, setPage] = useState(1);
    const [params, setParams] = useState<Record<string, unknown>>(defaultParams);
    const abortRef = useRef<AbortController | null>(null);

    // When defaultParams changes after mount (e.g. activeCompany loads asynchronously),
    // sync the new params and immediately re-fetch with them.
    const defaultParamsKey = JSON.stringify(defaultParams);
    const isFirstParamsRun = useRef(true);
    useEffect(() => {
        if (isFirstParamsRun.current) {
            isFirstParamsRun.current = false;
            return;
        }
        const newParams = JSON.parse(defaultParamsKey) as Record<string, unknown>;
        setParams(newParams);
        fetchList(1, newParams);
    }, [defaultParamsKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchList = useCallback(
        async (p = page, extraParams: Record<string, unknown> = {}) => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setState((s) => ({ ...s, loading: true, error: null }));
            try {
                const { data: res } = await api.get<ApiResponse<PaginatedData<T>>>(endpoint, {
                    params: { per_page: defaultPerPage, page: p, ...params, ...extraParams },
                    signal: controller.signal,
                });
                const meta = res.data;
                setState({
                    data: meta.data,
                    loading: false,
                    error: null,
                    current_page: meta.current_page,
                    last_page: meta.last_page,
                    per_page: meta.per_page,
                    total: meta.total,
                });
            } catch (err: any) {
                if (err.name === 'CanceledError') return;
                setState((s) => ({
                    ...s,
                    loading: false,
                    error: err.response?.data?.message ?? err.message ?? '请求失败',
                }));
            }
        },
        [endpoint, page, params, defaultPerPage],
    );

    useEffect(() => {
        fetchList(page);
        return () => abortRef.current?.abort();
    }, [page, endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

    const reload = useCallback(() => fetchList(page), [fetchList, page]);
    const goToPage = useCallback((p: number) => setPage(p), []);
    const search = useCallback(
        (extraParams: Record<string, unknown>) => {
            setParams((prev) => ({ ...prev, ...extraParams }));
            setPage(1);
            fetchList(1, extraParams);
        },
        [fetchList],
    );

    return {
        ...state,
        page,
        reload,
        goToPage,
        search,
        fetchList,
    };
}

// ── 单条记录操作 ──────────────────────────────────────────────

interface UseApiItemOptions<T> {
    endpoint: string;
    id?: number | string;
}

export function useApiItem<T = Record<string, unknown>>({ endpoint, id }: UseApiItemOptions<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (itemId?: number | string) => {
        const targetId = itemId ?? id;
        if (!targetId) return;
        setLoading(true);
        setError(null);
        try {
            const { data: res } = await api.get<ApiResponse<T>>(`${endpoint}/${targetId}`);
            setData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message ?? err.message);
        } finally {
            setLoading(false);
        }
    }, [endpoint, id]);

    useEffect(() => {
        if (id) fetch();
    }, [id, fetch]); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, loading, error, fetch, setData };
}

// ── CRUD 操作 ─────────────────────────────────────────────────

export function useApiCrud(endpoint: string) {
    const [loading, setLoading] = useState(false);

    const create = useCallback(
        async <T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T | null> => {
            setLoading(true);
            try {
                const { data: res } = await api.post<ApiResponse<T>>(endpoint, payload);
                return res.data;
            } finally {
                setLoading(false);
            }
        },
        [endpoint],
    );

    const update = useCallback(
        async <T = Record<string, unknown>>(id: number | string, payload: Record<string, unknown>): Promise<T | null> => {
            setLoading(true);
            try {
                const { data: res } = await api.put<ApiResponse<T>>(`${endpoint}/${id}`, payload);
                return res.data;
            } finally {
                setLoading(false);
            }
        },
        [endpoint],
    );

    const remove = useCallback(
        async (id: number | string): Promise<boolean> => {
            setLoading(true);
            try {
                await api.delete(`${endpoint}/${id}`);
                return true;
            } finally {
                setLoading(false);
            }
        },
        [endpoint],
    );

    return { create, update, remove, loading };
}
