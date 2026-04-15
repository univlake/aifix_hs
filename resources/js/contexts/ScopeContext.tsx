import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import { setScopeCompanyId } from '@/lib/scope-store';

// ── Types ─────────────────────────────────────────────────────────

export interface ScopeCompany {
    id: number;
    title: string;
    is_bloc: number;
    is_produce: number;
    pid: number;
    status: number;
}

export type ScopeMode = 'bloc' | 'produce';

interface PersistedScope {
    rootCompanyId: number;
    activeCompanyId: number;
    mode: ScopeMode;
}

interface ScopeContextType {
    /** Currently active (scoped) company */
    activeCompany: ScopeCompany | null;
    /** Current feature mode */
    mode: ScopeMode;
    /** True when the active company differs from the root company */
    isSubordinate: boolean;

    /** The logged-in user's own company */
    rootCompany: ScopeCompany | null;
    /** Root company capabilities */
    canBloc: boolean;
    canProduce: boolean;

    /** Direct subordinates of the root company (for the switcher) */
    subordinates: ScopeCompany[];
    loadingSubordinates: boolean;

    setMode: (mode: ScopeMode) => void;
    enterCompany: (company: ScopeCompany) => void;
    exitToRoot: () => void;

    isReady: boolean;
}

// ── Context ───────────────────────────────────────────────────────

const ScopeContext = createContext<ScopeContextType | null>(null);

const STORAGE_KEY = 'scope_state';

function loadPersisted(): PersistedScope | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function savePersisted(data: PersistedScope): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearPersisted(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// ── Provider ──────────────────────────────────────────────────────

export function ScopeProvider({ children }: { children: ReactNode }) {
    const { company: authCompany, isAuthenticated, isLoading } = useAuth();

    const [rootCompany, setRootCompany] = useState<ScopeCompany | null>(null);
    const [activeCompany, setActiveCompany] = useState<ScopeCompany | null>(null);
    const [mode, setModeState] = useState<ScopeMode>('produce');
    const [subordinates, setSubordinates] = useState<ScopeCompany[]>([]);
    const [loadingSubordinates, setLoadingSubordinates] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const initialized = useRef(false);

    // ── Initialise scope from auth company ────────────────────────
    useEffect(() => {
        if (isLoading || !isAuthenticated || !authCompany?.id) return;
        if (initialized.current) return;
        initialized.current = true;

        api.get(`/companies/${authCompany.id}`)
            .then((res) => {
                const full: ScopeCompany = res.data.data;
                setRootCompany(full);

                // Determine default mode
                const defaultMode: ScopeMode =
                    full.is_bloc && !full.is_produce ? 'bloc'
                        : full.is_produce && !full.is_bloc ? 'produce'
                            : 'bloc'; // both: default to bloc

                // Restore persisted scope if it belongs to the same root company
                const persisted = loadPersisted();
                if (persisted && persisted.rootCompanyId === full.id) {
                    setModeState(persisted.mode);

                    if (persisted.activeCompanyId === full.id) {
                        setActiveCompany(full);
                        setScopeCompanyId(full.id);
                    } else {
                        // Re-fetch subordinate company to ensure it still exists
                        api.get(`/companies/${persisted.activeCompanyId}`)
                            .then((r) => {
                                setActiveCompany(r.data.data);
                                setScopeCompanyId(r.data.data.id);
                            })
                            .catch(() => {
                                // Subordinate gone — fall back to root
                                setActiveCompany(full);
                                setScopeCompanyId(full.id);
                            });
                    }
                } else {
                    clearPersisted();
                    setModeState(defaultMode);
                    setActiveCompany(full);
                    setScopeCompanyId(full.id);
                }

                setIsReady(true);
            })
            .catch(() => {
                // Fall back to minimal company from auth
                const fallback: ScopeCompany = {
                    id: authCompany.id,
                    title: authCompany.title,
                    is_bloc: 0,
                    is_produce: 1,
                    pid: 0,
                    status: 1,
                };
                setRootCompany(fallback);
                setActiveCompany(fallback);
                setModeState('produce');
                setScopeCompanyId(fallback.id);
                setIsReady(true);
            });
    }, [isLoading, isAuthenticated, authCompany]);

    // ── Fetch direct subordinates ────────────────────────────────
    useEffect(() => {
        if (!rootCompany) return;
        setLoadingSubordinates(true);
        api.get('/companies', { params: { pid: rootCompany.id, per_page: 50 } })
            .then((res) => {
                const items: ScopeCompany[] = (res.data.data?.data ?? []);
                setSubordinates(items);
            })
            .catch(() => setSubordinates([]))
            .finally(() => setLoadingSubordinates(false));
    }, [rootCompany?.id]);

    // ── Reset when user logs out ──────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            setRootCompany(null);
            setActiveCompany(null);
            setSubordinates([]);
            setIsReady(false);
            initialized.current = false;
            clearPersisted();
            setScopeCompanyId(null);
        }
    }, [isAuthenticated, isLoading]);

    // ── Actions ───────────────────────────────────────────────────

    const persist = useCallback(
        (active: ScopeCompany, newMode: ScopeMode, root: ScopeCompany) => {
            savePersisted({ rootCompanyId: root.id, activeCompanyId: active.id, mode: newMode });
            setScopeCompanyId(active.id);
        },
        [],
    );

    const setMode = useCallback(
        (newMode: ScopeMode) => {
            if (!rootCompany || !activeCompany) return;
            setModeState(newMode);
            // Switching mode always returns to root company view
            setActiveCompany(rootCompany);
            persist(rootCompany, newMode, rootCompany);
        },
        [rootCompany, activeCompany, persist],
    );

    const enterCompany = useCallback(
        (company: ScopeCompany) => {
            if (!rootCompany) return;
            setActiveCompany(company);
            setModeState('produce'); // subordinate view is always produce
            persist(company, 'produce', rootCompany);
        },
        [rootCompany, persist],
    );

    const exitToRoot = useCallback(() => {
        if (!rootCompany) return;
        const defaultMode: ScopeMode = rootCompany.is_bloc ? 'bloc' : 'produce';
        setActiveCompany(rootCompany);
        setModeState(defaultMode);
        persist(rootCompany, defaultMode, rootCompany);
    }, [rootCompany, persist]);

    // ── Derived ───────────────────────────────────────────────────

    const canBloc = Boolean(rootCompany?.is_bloc);
    const canProduce = Boolean(rootCompany?.is_produce);
    const isSubordinate = Boolean(
        rootCompany && activeCompany && activeCompany.id !== rootCompany.id,
    );

    return (
        <ScopeContext.Provider
            value={{
                activeCompany,
                mode,
                isSubordinate,
                rootCompany,
                canBloc,
                canProduce,
                subordinates,
                loadingSubordinates,
                setMode,
                enterCompany,
                exitToRoot,
                isReady,
            }}
        >
            {children}
        </ScopeContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────

export function useScope(): ScopeContextType {
    const ctx = useContext(ScopeContext);
    if (!ctx) throw new Error('useScope must be used inside ScopeProvider');
    return ctx;
}
