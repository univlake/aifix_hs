import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Shield,
    User,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUsernameCheck } from '@/hooks/use-username-check';
import { authApi } from '@/lib/auth';
import { getErrorMessage } from '@/types/api-error';

export default function FirstLoginSetup() {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const usernameCheck = useUsernameCheck(newUsername, user?.username);

    // 未登录 → 去登录页；不需要首次设置 → 去仪表板
    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.visit('/login');

            return;
        }

        if (user && !user.must_change_credentials) {
            router.visit('/dashboard');
        }
    }, [isLoading, isAuthenticated, user]);

    const passwordMismatch =
        confirmPassword.length > 0 && newPassword !== confirmPassword;
    const passwordTooShort =
        newPassword.length > 0 && newPassword.length < 6;
    const canSubmit =
        usernameCheck.status === 'available' &&
        newPassword.length >= 6 &&
        newPassword === confirmPassword &&
        !submitting;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await authApi.firstLoginSetup({
                new_username: newUsername.trim(),
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            // 成功后强制重新登录
            await logout();
        } catch (err: unknown) {
            setError(getErrorMessage(err, '设置失败，请重试'));
            setSubmitting(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#070d1f]">
                <Activity className="h-6 w-6 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <>
            <Head title="首次登录 · 修改账号信息" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d1f] px-4 py-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="bg-grid absolute inset-0 opacity-50" />
                    <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[100px]" />
                </div>

                <div className="animate-fade-in-up relative z-10 w-full max-w-md">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-500/5 blur-sm" />

                    <div className="glass relative rounded-2xl p-8">
                        <div className="mb-6 text-center">
                            <div className="glow-blue mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-100">
                                首次登录设置
                            </h1>
                            <p className="mt-1.5 text-sm text-slate-500">
                                当前账号 <span className="text-slate-300">{user.username}</span>{' '}
                                为系统分配的默认账号，请修改为你自己的用户名和密码
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="new_username"
                                    className="block text-xs font-medium tracking-wider text-slate-400 uppercase"
                                >
                                    新用户名
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <User className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <input
                                        id="new_username"
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) =>
                                            setNewUsername(e.target.value)
                                        }
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={30}
                                        placeholder="3-30 位字母、数字、_ - ."
                                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-10 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                                        <UsernameStatus check={usernameCheck} />
                                    </div>
                                </div>
                                <UsernameHint check={usernameCheck} />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="new_password"
                                    className="block text-xs font-medium tracking-wider text-slate-400 uppercase"
                                >
                                    新密码
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <Lock className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <input
                                        id="new_password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                        minLength={6}
                                        placeholder="至少 6 位"
                                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-10 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 transition-colors hover:text-slate-400"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {passwordTooShort && (
                                    <p className="text-xs text-amber-400">
                                        密码至少 6 位
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="confirm_password"
                                    className="block text-xs font-medium tracking-wider text-slate-400 uppercase"
                                >
                                    确认新密码
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <Lock className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <input
                                        id="confirm_password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        minLength={6}
                                        placeholder="再次输入新密码"
                                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-10 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                                    />
                                </div>
                                {passwordMismatch && (
                                    <p className="text-xs text-amber-400">
                                        两次密码输入不一致
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="relative mt-2 w-full overflow-hidden rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Activity className="h-4 w-4 animate-spin" />
                                        提交中...
                                    </span>
                                ) : (
                                    '保存并重新登录'
                                )}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs text-slate-600">
                            设置成功后需使用新账号重新登录
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function UsernameStatus({
    check,
}: {
    check: { status: string; reason: string | null };
}) {
    if (check.status === 'checking') {
        return <Activity className="h-4 w-4 animate-spin text-slate-500" />;
    }

    if (check.status === 'available') {
        return <Check className="h-4 w-4 text-emerald-400" />;
    }

    if (check.status === 'unavailable') {
        return <X className="h-4 w-4 text-red-400" />;
    }

    return null;
}

function UsernameHint({
    check,
}: {
    check: { status: string; reason: string | null };
}) {
    if (check.status === 'available') {
        return (
            <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                用户名可用
            </p>
        );
    }

    if (check.status === 'unavailable' && check.reason) {
        return (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {check.reason}
            </p>
        );
    }

    return null;
}
