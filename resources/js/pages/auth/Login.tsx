import { Head, Link, router } from '@inertiajs/react';
import {
    Shield,
    Eye,
    EyeOff,
    Lock,
    User,
    AlertCircle,
    Activity,
    ArrowLeft,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { prefetchPublicKey } from '@/lib/crypto';
import { getErrorMessage } from '@/types/api-error';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Warm up the public key cache so encryption is instant on submit
    useEffect(() => {
        prefetchPublicKey();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            router.visit('/dashboard');
        } catch (err: unknown) {
            setError(getErrorMessage(err, '登录失败，请检查用户名和密码'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="登录" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d1f] px-4">
                {/* Background */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="bg-grid absolute inset-0 opacity-50" />
                    <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-indigo-700/8 blur-[100px]" />
                    {/* Scan line */}
                    <div className="animate-scan absolute right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
                </div>

                {/* Back button */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    返回首页
                </Link>

                {/* System status */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    系统在线
                </div>

                {/* Login card */}
                <div className="animate-fade-in-up relative z-10 w-full max-w-md">
                    {/* Outer glow border */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-500/5 blur-sm" />

                    <div className="glass relative rounded-2xl p-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="glow-blue animate-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-100">
                                安全生产管理系统
                            </h1>
                            <p className="mt-1.5 text-sm text-slate-500">
                                请输入账号密码登录管理平台
                            </p>
                        </div>

                        {/* Error alert */}
                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="username"
                                    className="block text-xs font-medium tracking-wider text-slate-400 uppercase"
                                >
                                    用户名
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <User className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="请输入用户名"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        required
                                        autoFocus
                                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-medium tracking-wider text-slate-400 uppercase"
                                >
                                    密码
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <Lock className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="请输入密码"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
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
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative mt-2 w-full overflow-hidden rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Activity className="h-4 w-4 animate-spin" />
                                        登录中...
                                    </span>
                                ) : (
                                    '登 录'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-blue-900/50" />
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-slate-600">
                            还没有账号？
                            <a
                                href="/register"
                                className="ml-1 text-blue-500 transition-colors hover:text-blue-400"
                            >
                                联系管理员注册
                            </a>
                        </p>
                    </div>

                    {/* Bottom security note */}
                    <p className="mt-4 text-center text-xs text-slate-700">
                        <Lock className="mr-1 inline h-3 w-3" />
                        所有连接均受 TLS 加密保护
                    </p>
                </div>
            </div>
        </>
    );
}
