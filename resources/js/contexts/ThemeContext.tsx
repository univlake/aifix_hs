import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
    mode: 'dark',
    setMode: () => {},
    resolvedTheme: 'dark',
});

function getAutoTheme(): 'light' | 'dark' {
    const h = new Date().getHours();

    return h >= 6 && h < 18 ? 'light' : 'dark';
}

function applyThemeClass(resolved: 'light' | 'dark') {
    const html = document.documentElement;
    html.classList.toggle('dark', resolved === 'dark');
    html.classList.toggle('light', resolved === 'light');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeRaw] = useState<ThemeMode>(
        () => (localStorage.getItem('app-theme') as ThemeMode) ?? 'dark',
    );
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        const saved =
            (localStorage.getItem('app-theme') as ThemeMode) ?? 'dark';
        const resolved = saved === 'auto' ? getAutoTheme() : saved;
        applyThemeClass(resolved);

        return resolved;
    });

    const applyAndSet = useCallback((resolved: 'light' | 'dark') => {
        applyThemeClass(resolved);
        setResolvedTheme(resolved);
    }, []);

    useEffect(() => {
        if (mode !== 'auto') {
            applyAndSet(mode);

            return;
        }

        applyAndSet(getAutoTheme());

        // Re-check every 60 s; transitions happen at 6:00 and 18:00
        const interval = setInterval(() => {
            applyAndSet(getAutoTheme());
        }, 60_000);

        return () => clearInterval(interval);
    }, [mode, applyAndSet]);

    const setMode = useCallback((m: ThemeMode) => {
        localStorage.setItem('app-theme', m);
        setModeRaw(m);
    }, []);

    return (
        <ThemeContext.Provider value={{ mode, setMode, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
