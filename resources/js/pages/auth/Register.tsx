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
    Building2,
    Phone,
    Mail,
    UserCircle,
    ChevronDown,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/auth';
import { prefetchPublicKey } from '@/lib/crypto';
import { getErrorMessage } from '@/types/api-error';

interface Company {
    id: number;
    title: string;
}

export default function Register() {
    const { login } = useAuth();
    const [form, setForm] = useState({
        username: '',
        password: '',
        password_confirmation: '',
        nickname: '',
        company_id: '',
        phone: '',
        email: '',
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        prefetchPublicKey();
        authApi
            .companiesPublic()
            .then(setCompanies)
            .catch(() => {});
    }, []);

    const update = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.password_confirmation) {
            setError('两次密码输入不一致');

            return;
        }

        setLoading(true);

        try {
            await authApi.register({
                username: form.username,
                password: form.password,
                password_confirmation: form.password_confirmation,
                nickname: form.nickname,
                company_id: Number(form.company_id),
                phone: form.phone || undefined,
                email: form.email || undefined,
            });
            // register returns a token — use login to populate auth state, then redirect
            await login(form.username, form.password);
            router.visit('/dashboard');
        } catch (err: unknown) {
            setError(getErrorMessage(err, '注册失败，请稍后重试'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="注册" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d1f] px-4 py-10">
                {/* Background */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="bg-grid absolute inset-0 opacity-50" />
                    <div className="absolute top-0 right-0 h-[400px] w-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-violet-700/8 blur-[100px]" />
                    <div className="animate-scan absolute right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
                </div>

                {/* Back button */}
                <Link
                    href="/login"
                    className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    返回登录
                </Link>

                {/* Card */}
                <div className="animate-fade-in-up relative z-10 w-full max-w-md">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-500/5 blur-sm" />

                    <div className="glass relative rounded-2xl p-8">
                        {/* Header */}
                        <div className="mb-7 text-center">
                            <div className="glow-blue mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/15">
                                <Shield className="h-7 w-7 text-blue-400" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-100">
                                创建账号
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                注册安全生产管理系统账号
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <Field label="用户名" required>
                                <InputWithIcon
                                    icon={
                                        <User className="h-4 w-4 text-slate-600" />
                                    }
                                >
                                    <input
                                        type="text"
                                        placeholder="请输入用户名"
                                        value={form.username}
                                        onChange={(e) =>
                                            update('username', e.target.value)
                                        }
                                        required
                                        autoFocus
                                        className={inputCls}
                                    />
                                </InputWithIcon>
                            </Field>

                            {/* Nickname */}
                            <Field label="昵称" required>
                                <InputWithIcon
                                    icon={
                                        <UserCircle className="h-4 w-4 text-slate-600" />
                                    }
                                >
                                    <input
                                        type="text"
                                        placeholder="请输入昵称"
                                        value={form.nickname}
                                        onChange={(e) =>
                                            update('nickname', e.target.value)
                                        }
                                        required
                                        className={inputCls}
                                    />
                                </InputWithIcon>
                            </Field>

                            {/* Company */}
                            <Field label="所属企业" required>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <Building2 className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <select
                                        value={form.company_id}
                                        onChange={(e) =>
                                            update('company_id', e.target.value)
                                        }
                                        required
                                        className={`${inputCls} appearance-none pr-8`}
                                    >
                                        <option value="" disabled>
                                            选择所属企业
                                        </option>
                                        {companies.map((c) => (
                                            <option
                                                key={c.id}
                                                value={String(c.id)}
                                                className="bg-[#0d1530] text-slate-200"
                                            >
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronDown className="h-4 w-4 text-slate-600" />
                                    </div>
                                </div>
                            </Field>

                            {/* Phone + Email side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="手机号">
                                    <InputWithIcon
                                        icon={
                                            <Phone className="h-4 w-4 text-slate-600" />
                                        }
                                    >
                                        <input
                                            type="text"
                                            placeholder="可选"
                                            value={form.phone}
                                            onChange={(e) =>
                                                update('phone', e.target.value)
                                            }
                                            className={inputCls}
                                        />
                                    </InputWithIcon>
                                </Field>
                                <Field label="邮箱">
                                    <InputWithIcon
                                        icon={
                                            <Mail className="h-4 w-4 text-slate-600" />
                                        }
                                    >
                                        <input
                                            type="email"
                                            placeholder="可选"
                                            value={form.email}
                                            onChange={(e) =>
                                                update('email', e.target.value)
                                            }
                                            className={inputCls}
                                        />
                                    </InputWithIcon>
                                </Field>
                            </div>

                            {/* Password */}
                            <Field label="密码" required>
                                <InputWithIcon
                                    icon={
                                        <Lock className="h-4 w-4 text-slate-600" />
                                    }
                                >
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="至少 6 位"
                                        value={form.password}
                                        onChange={(e) =>
                                            update('password', e.target.value)
                                        }
                                        required
                                        className={`${inputCls} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 hover:text-slate-400"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </InputWithIcon>
                            </Field>

                            {/* Confirm password */}
                            <Field label="确认密码" required>
                                <InputWithIcon
                                    icon={
                                        <Lock className="h-4 w-4 text-slate-600" />
                                    }
                                >
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="再次输入密码"
                                        value={form.password_confirmation}
                                        onChange={(e) =>
                                            update(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className={`${inputCls} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm(!showConfirm)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 hover:text-slate-400"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </InputWithIcon>
                            </Field>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-1 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Activity className="h-4 w-4 animate-spin" />
                                        注册中...
                                    </span>
                                ) : (
                                    '注 册'
                                )}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs text-slate-600">
                            已有账号？
                            <Link
                                href="/login"
                                className="ml-1 text-blue-500 transition-colors hover:text-blue-400"
                            >
                                立即登录
                            </Link>
                        </p>
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-700">
                        <Lock className="mr-1 inline h-3 w-3" />
                        密码经 RSA 加密后传输，全程安全
                    </p>
                </div>
            </div>
        </>
    );
}

// ── Small layout helpers ──────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30';

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wider text-slate-400 uppercase">
                {label}
                {required && <span className="ml-0.5 text-blue-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function InputWithIcon({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                {icon}
            </div>
            {children}
        </div>
    );
}
