import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { ScopeProvider, useScope } from '@/contexts/ScopeContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Shield, ArrowLeft } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { isLoading, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.visit('/login');
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#070d1f]">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15">
                        <Shield className="h-7 w-7 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-sm text-slate-500">验证登录状态...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <ScopeProvider>
            <AuthenticatedShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
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
}: {
    children: React.ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
}) {
    const { isSubordinate, activeCompany, rootCompany, exitToRoot } = useScope();

    return (
        <div className="flex h-screen overflow-hidden bg-[#070d1f]">
            <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Subordinate scope breadcrumb */}
                {isSubordinate && activeCompany && rootCompany && (
                    <div className="shrink-0 flex items-center gap-3 border-b border-amber-500/20 bg-amber-950/20 px-5 py-2.5">
                        <button
                            onClick={exitToRoot}
                            className="flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-600/10 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-600/20"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            返回集团
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="text-slate-600">{rootCompany.title}</span>
                            <span className="text-slate-700">›</span>
                            <span className="text-amber-400 font-medium">{activeCompany.title}</span>
                        </div>
                        <span className="ml-auto rounded-full border border-amber-500/20 bg-amber-600/10 px-2 py-0.5 text-[10px] text-amber-500">
                            生产视图
                        </span>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
