import {
    Menu,
    LogOut,
    User,
    Key,
    ChevronDown,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    const initials = (user?.nickname ?? user?.username ?? 'U')
        .slice(0, 1)
        .toUpperCase();

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-blue-900/40 bg-[#060c1a] px-4">
            <button
                onClick={onMenuClick}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-600/10 hover:text-slate-300 md:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User menu */}
            <DropdownMenu>
                <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-sm text-slate-300 transition-all outline-none hover:border-blue-700/50 hover:bg-blue-950/50">
                    {/* Avatar circle */}
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/25 text-xs font-semibold text-blue-300">
                        {initials}
                    </span>
                    <span className="hidden max-w-[120px] truncate sm:block">
                        {user?.nickname ?? user?.username}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-52 border-blue-900/50 bg-[#0d1530]"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-slate-400">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-medium text-slate-200">
                                    {user?.nickname}
                                </p>
                                <p className="text-xs text-slate-600">
                                    {user?.username}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-blue-900/40" />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="cursor-pointer text-slate-400 hover:text-slate-200"
                            onClick={() => (window.location.href = '/profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            个人资料
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer text-slate-400 hover:text-slate-200"
                            onClick={() =>
                                (window.location.href = '/change-password')
                            }
                        >
                            <Key className="mr-2 h-4 w-4" />
                            修改密码
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-blue-900/40" />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

// ── Theme toggle ─────────────────────────────────────────────────

const THEME_OPTIONS: {
    mode: ThemeMode;
    icon: React.ReactNode;
    label: string;
}[] = [
    { mode: 'light', icon: <Sun className="h-3.5 w-3.5" />, label: '白天模式' },
    {
        mode: 'auto',
        icon: <Monitor className="h-3.5 w-3.5" />,
        label: '跟随系统',
    },
    { mode: 'dark', icon: <Moon className="h-3.5 w-3.5" />, label: '暗黑模式' },
];

function ThemeToggle() {
    const { mode, setMode } = useTheme();

    return (
        <div className="flex items-center rounded-lg border border-blue-900/40 bg-[#0a1428] p-0.5">
            {THEME_OPTIONS.map((opt) => (
                <button
                    key={opt.mode}
                    onClick={() => setMode(opt.mode)}
                    title={opt.label}
                    className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                        mode === opt.mode
                            ? 'bg-blue-600/30 text-blue-300'
                            : 'text-slate-600 hover:text-slate-400',
                    )}
                >
                    {opt.icon}
                </button>
            ))}
        </div>
    );
}
