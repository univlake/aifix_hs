import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Key,
    Loader2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/auth';
import { getErrorMessage } from '@/types/api-error';

const inputClass =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 pr-10 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

export default function ChangePasswordIndex() {
    const { user, logout } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('新密码至少 6 位');

            return;
        }

        if (newPassword !== confirmPassword) {
            setError('两次输入的新密码不一致');

            return;
        }

        if (oldPassword === newPassword) {
            setError('新密码不能与原密码相同');

            return;
        }

        if (!user) {
            setError('未登录或会话已过期');

            return;
        }

        setSaving(true);

        try {
            await authApi.resetPassword({
                username: user.username,
                old_password: oldPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            setSuccess('密码修改成功，即将重新登录...');
            setTimeout(() => {
                logout();
            }, 1500);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '密码修改失败，请重试'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="修改密码" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-100">修改密码</h1>
                <p className="mt-1 text-sm text-slate-500">
                    为保障账号安全，建议定期更新密码
                </p>
            </div>

            <div className="mx-auto max-w-xl rounded-2xl border border-blue-900/40 bg-[#0a1428]/60 p-6 shadow-lg shadow-blue-950/20">
                <div className="mb-5 flex items-center gap-3 border-b border-blue-900/30 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/15">
                        <Key className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">
                            账号密码
                        </p>
                        <p className="text-xs text-slate-500">
                            密码至少 6 位，建议包含字母与数字
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-600/8 px-3 py-2.5 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordField
                        label="原密码"
                        value={oldPassword}
                        onChange={setOldPassword}
                        visible={showOld}
                        onToggleVisible={() => setShowOld((v) => !v)}
                        required
                    />

                    <PasswordField
                        label="新密码"
                        value={newPassword}
                        onChange={setNewPassword}
                        visible={showNew}
                        onToggleVisible={() => setShowNew((v) => !v)}
                        required
                    />

                    <PasswordField
                        label="确认新密码"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        visible={showConfirm}
                        onToggleVisible={() => setShowConfirm((v) => !v)}
                        required
                    />

                    <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 pt-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/dashboard')}
                            className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={saving || Boolean(success)}
                            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600/30 hover:text-blue-200 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {saving && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {saving ? '保存中...' : '确认修改'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    visible,
    onToggleVisible,
    required,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    visible: boolean;
    onToggleVisible: () => void;
    required?: boolean;
}) {
    return (
        <div>
            <label className={labelClass}>
                {label}
                {required && <span className="ml-1 text-blue-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    autoComplete="off"
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={onToggleVisible}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 transition-colors hover:text-slate-400"
                    tabIndex={-1}
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
