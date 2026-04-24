import { router, usePage } from '@inertiajs/react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScopeProvider, useScope } from '@/contexts/ScopeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/use-auth';
import { Header } from './Header';
import { Sidebar, getRoutePermission } from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <ThemeProvider>
            <AppLayoutInner>{children}</AppLayoutInner>
        </ThemeProvider>
    );
}

function AppLayoutInner({ children }: AppLayoutProps) {
    const { user, isLoading, isAuthenticated, hasPermission } = useAuth();
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.visit('/login');

            return;
        }

        // 首次登录必改账号信息 — 强制去 /first-login-setup
        if (user?.must_change_credentials) {
            router.visit('/first-login-setup');
        }
    }, [isLoading, isAuthenticated, user]);

    // Rule 3 at the route level: if the user navigates (or pastes a URL) to a
    // page they don't have permission for, bounce them to /dashboard. Runs after
    // auth finishes loading so we don't redirect while permissions are empty.
    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            return;
        }

        const pathname = url.split('?')[0] ?? url;
        const required = getRoutePermission(pathname);

        if (!required) {
            return;
        }

        const perms = Array.isArray(required) ? required : [required];
        const allowed = perms.some((p) => hasPermission(p));

        if (!allowed && pathname !== '/dashboard') {
            router.visit('/dashboard');
        }
    }, [url, isLoading, isAuthenticated, hasPermission]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#070d1f]">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15">
                        <Shield className="h-7 w-7 animate-pulse text-blue-400" />
                    </div>
                    <p className="text-sm text-slate-500">验证登录状态...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <ScopeProvider>
            <AuthenticatedShell
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                resetKey={url}
            >
                {children}
            </AuthenticatedShell>
        </ScopeProvider>
    );
}

// ── Inner shell — can access ScopeProvider ────────────────────────

function AuthenticatedShell({
    children,
    sidebarOpen,
    setSidebarOpen,
    resetKey,
}: {
    children: React.ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    resetKey: string;
}) {
    const { isSubordinate, activeCompany, rootCompany, exitToRoot } =
        useScope();

    return (
        <div className="flex h-screen overflow-hidden bg-[#070d1f]">
            <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Subordinate scope breadcrumb */}
                {isSubordinate && activeCompany && rootCompany && (
                    <div className="flex shrink-0 items-center gap-3 border-b border-amber-500/20 bg-amber-950/20 px-5 py-2.5">
                        <button
                            onClick={exitToRoot}
                            className="flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-600/10 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-600/20"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            返回集团
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="text-slate-600">
                                {rootCompany.title}
                            </span>
                            <span className="text-slate-700">›</span>
                            <span className="font-medium text-amber-400">
                                {activeCompany.title}
                            </span>
                        </div>
                        <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-600/10 px-2 py-0.5 text-[10px] text-amber-500">
                            生产视图
                        </span>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6">
                    <ErrorBoundary resetKey={resetKey}>{children}</ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
