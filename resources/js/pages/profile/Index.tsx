import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Check,
    CheckCircle2,
    Loader2,
    User,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUsernameCheck } from '@/hooks/use-username-check';
import { authApi } from '@/lib/auth';
import { getErrorMessage } from '@/types/api-error';

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

export default function ProfileIndex() {
    const { user, company, isLoading, logout, refetch } = useAuth();
    const [username, setUsername] = useState('');
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username ?? '');
            setNickname(user.nickname ?? '');
            setPhone(user.phone ?? '');
            setEmail(user.email ?? '');
        }
    }, [user]);

    const usernameChanged = !!user && username.trim() !== user.username;
    const usernameCheck = useUsernameCheck(
        usernameChanged ? username : '',
        user?.username,
    );
    const usernameBlocking =
        usernameChanged &&
        (usernameCheck.status === 'checking' ||
            usernameCheck.status === 'unavailable' ||
            usernameCheck.status === 'idle');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (usernameBlocking) {
            return;
        }

        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const willChangeUsername = usernameChanged;
            await authApi.updateUserInfo({
                nickname: nickname.trim(),
                ...(willChangeUsername ? { username: username.trim() } : {}),
                phone: phone.trim() || null,
                email: email.trim() || null,
            });

            // 改了用户名 → Passport token 绑定的是旧用户名，强制重新登录
            if (willChangeUsername) {
                await logout();

                return;
            }

            await refetch();
            setSuccess('个人资料更新成功');
        } catch (err: unknown) {
            setError(getErrorMessage(err, '更新失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="个人资料" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-100">个人资料</h1>
                <p className="mt-1 text-sm text-slate-500">
                    维护当前账号的基本信息
                </p>
            </div>

            <div className="mx-auto max-w-2xl rounded-2xl border border-blue-900/40 bg-[#0a1428]/60 p-6 shadow-lg shadow-blue-950/20">
                {isLoading && !user ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    </div>
                ) : !user ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        未登录或会话已过期
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center gap-3 border-b border-blue-900/30 pb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/15">
                                <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">
                                    {user.nickname || user.username}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {company?.title ?? '—'}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-600/8 px-3 py-2.5 text-sm text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                {success}
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    用户名{' '}
                                    <span className="text-blue-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        required
                                        minLength={3}
                                        maxLength={30}
                                        className={inputClass + ' pr-10'}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        {usernameChanged && (
                                            <UsernameStatusIcon
                                                status={usernameCheck.status}
                                            />
                                        )}
                                    </div>
                                </div>
                                <UsernameHint
                                    changed={usernameChanged}
                                    status={usernameCheck.status}
                                    reason={usernameCheck.reason}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>所属企业</label>
                                <input
                                    type="text"
                                    value={company?.title ?? ''}
                                    disabled
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    昵称 <span className="text-blue-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                    required
                                    maxLength={100}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>手机号</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    maxLength={255}
                                    placeholder="请输入手机号"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>邮箱</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    maxLength={255}
                                    placeholder="请输入邮箱"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 pt-4">
                            <button
                                type="submit"
                                disabled={saving || usernameBlocking}
                                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                {saving ? '保存中...' : '保存修改'}
                            </button>
                        </div>

                        {usernameChanged && (
                            <p className="text-xs text-amber-400">
                                修改用户名后需要重新登录
                            </p>
                        )}
                    </form>
                )}
            </div>
        </>
    );
}

function UsernameStatusIcon({ status }: { status: string }) {
    if (status === 'checking') {
        return <Activity className="h-4 w-4 animate-spin text-slate-500" />;
    }

    if (status === 'available') {
        return <Check className="h-4 w-4 text-emerald-400" />;
    }

    if (status === 'unavailable') {
        return <X className="h-4 w-4 text-red-400" />;
    }

    return null;
}

function UsernameHint({
    changed,
    status,
    reason,
}: {
    changed: boolean;
    status: string;
    reason: string | null;
}) {
    if (!changed) {
        return (
            <p className="mt-1.5 text-xs text-slate-600">
                3-30 位字母、数字、_ - .
            </p>
        );
    }

    if (status === 'available') {
        return (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                用户名可用
            </p>
        );
    }

    if (status === 'unavailable' && reason) {
        return (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {reason}
            </p>
        );
    }

    if (status === 'checking') {
        return <p className="mt-1.5 text-xs text-slate-500">检查中...</p>;
    }

    return null;
}
