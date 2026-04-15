import { Link } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User, Key, ChevronDown } from 'lucide-react';

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

            {/* User menu */}
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-blue-900/40 bg-[#0a1428] px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-blue-700/50 hover:bg-blue-950/50 outline-none cursor-pointer">
                    {/* Avatar circle */}
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/25 text-xs font-semibold text-blue-300">
                        {initials}
                    </span>
                    <span className="hidden sm:block max-w-[120px] truncate">
                        {user?.nickname ?? user?.username}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 border-blue-900/50 bg-[#0d1530]">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-slate-400">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-medium text-slate-200">{user?.nickname}</p>
                                <p className="text-xs text-slate-600">{user?.username}</p>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-blue-900/40" />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="text-slate-400 hover:text-slate-200 cursor-pointer"
                            onClick={() => window.location.href = '/profile'}
                        >
                            <User className="mr-2 h-4 w-4" />
                            个人资料
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-slate-400 hover:text-slate-200 cursor-pointer"
                            onClick={() => window.location.href = '/change-password'}
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
