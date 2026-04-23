import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Building2,
    Search,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Plus,
    Trash2,
    X,
    Loader2,
    Copy,
    Check,
    Download,
    KeyRound,
    Power,
    PowerOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/types/api-error';

interface Company {
    id: number;
    title: string;
    credit_code?: string;
    address?: string;
    status: number;
    status_str: string;
    pid: number;
    is_bloc: number;
    is_produce: number;
    enterprise_type?: { title: string };
    operational_type?: { title: string };
}

interface PaginatedResponse {
    data: Company[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface TypeOption {
    id: number;
    title: string;
}

const inputCls =
    'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';

function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                {children}
            </div>
        </div>
    );
}

export default function Subsidiaries() {
    const { rootCompany, enterCompany } = useScope();
    const { canWrite } = usePermission();
    const canCreate = canWrite('companies.create');
    const canDelete = canWrite('companies.delete');
    const canUpdate = canWrite('companies.update');

    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    const [enterpriseTypes, setEnterpriseTypes] = useState<TypeOption[]>([]);
    const [operationalTypes, setOperationalTypes] = useState<TypeOption[]>([]);

    const emptyForm = () => ({
        title: '',
        credit_code: '',
        address: '',
        enterprise_type_id: '',
        operational_type_id: '',
        is_produce: false,
        is_bloc: false,
    });
    const [form, setForm] = useState(emptyForm());
    const set = <K extends keyof ReturnType<typeof emptyForm>>(
        k: K,
        v: ReturnType<typeof emptyForm>[K],
    ) => setForm((f) => ({ ...f, [k]: v }));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [deleteItem, setDeleteItem] = useState<Company | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toggleItem, setToggleItem] = useState<Company | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    const [credentials, setCredentials] = useState<{
        companyTitle: string;
        username: string;
        password: string;
    } | null>(null);

    const handleView = (c: Company) => {
        enterCompany({
            id: c.id,
            title: c.title,
            is_bloc: c.is_bloc ?? 0,
            is_produce: c.is_produce ?? 1,
            pid: c.pid ?? rootCompany!.id,
            status: c.status,
        });
        router.visit('/enterprise/current');
    };

    const fetchData = (p: number, q: string) => {
        if (!rootCompany?.id) {
            return;
        }

        setLoading(true);
        const params: Record<string, unknown> = {
            pid: rootCompany.id,
            page: p,
            per_page: 15,
        };

        if (q) {
            params.title = q;
        }

        api.get('/companies', { params })
            .then((res) => setData(res.data.data))
            .catch(() => setError('加载下级企业列表失败'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(page, search);
    }, [rootCompany?.id, page]);

    useEffect(() => {
        if (!canCreate) {
            return;
        }

        Promise.all([
            api.get('/enterprise-types').catch(() => null),
            api.get('/operational-types').catch(() => null),
        ]).then(([etRes, otRes]) => {
            if (etRes) {
                setEnterpriseTypes(
                    etRes.data.data?.data ?? etRes.data.data ?? [],
                );
            }

            if (otRes) {
                setOperationalTypes(
                    otRes.data.data?.data ?? otRes.data.data ?? [],
                );
            }
        });
    }, [canCreate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData(1, search);
    };

    const openCreate = () => {
        setForm(emptyForm());
        setFormError('');
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setFormError('企业名称不能为空');

            return;
        }

        if (!rootCompany?.id) {
            setFormError('未定位到当前企业');

            return;
        }

        setFormLoading(true);
        setFormError('');

        try {
            const res = await api.post('/companies', {
                title: form.title,
                credit_code: form.credit_code || null,
                address: form.address || null,
                enterprise_type_id: form.enterprise_type_id
                    ? Number(form.enterprise_type_id)
                    : null,
                operational_type_id: form.operational_type_id
                    ? Number(form.operational_type_id)
                    : null,
                is_produce: form.is_produce ? 1 : 0,
                is_bloc: form.is_bloc ? 1 : 0,
                pid: rootCompany.id,
            });

            const created = res.data.data ?? {};
            const creds = created.admin_credentials;
            const createdTitle = form.title;

            setDialogOpen(false);
            fetchData(page, search);

            if (creds?.username && creds?.password) {
                setCredentials({
                    companyTitle: createdTitle,
                    username: creds.username,
                    password: creds.password,
                });
            }
        } catch (err: unknown) {
            setFormError(getErrorMessage(err, '新增失败，请重试'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) {
            return;
        }

        setDeleteLoading(true);

        try {
            await api.delete(`/companies/${deleteItem.id}`);
            setDeleteItem(null);
            fetchData(page, search);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '删除失败，请重试'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggle = async () => {
        if (!toggleItem) {
            return;
        }

        setToggleLoading(true);

        try {
            await api.patch(`/companies/${toggleItem.id}/toggle-status`);
            setToggleItem(null);
            fetchData(page, search);
        } catch (err: unknown) {
            setError(getErrorMessage(err, '操作失败，请重试'));
            setToggleItem(null);
        } finally {
            setToggleLoading(false);
        }
    };

    const statusColors: Record<number, string> = {
        0: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
        1: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
        2: 'border-slate-500/30 bg-slate-600/10 text-slate-400',
    };

    return (
        <>
            <Head title="下级企业" />

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        下级企业
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        管理当前企业的直属下级企业
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {data && (
                        <span className="text-xs text-slate-500">
                            共 {data.total} 家
                        </span>
                    )}
                    {canCreate && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            新增下级企业
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
                    <input
                        type="text"
                        placeholder="搜索企业名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-blue-900/50 bg-[#0a1428] py-2.5 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-600 transition-all outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                    />
                </div>
            </form>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#0d1530]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/40">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                    企业名称
                                </th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase md:table-cell">
                                    企业类型
                                </th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase lg:table-cell">
                                    统一社会信用代码
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                    状态
                                </th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-slate-600 uppercase">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr
                                        key={i}
                                        className="animate-pulse border-b border-blue-900/20"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="h-4 w-48 rounded bg-slate-800" />
                                        </td>
                                        <td className="hidden px-5 py-4 md:table-cell">
                                            <div className="h-4 w-24 rounded bg-slate-800" />
                                        </td>
                                        <td className="hidden px-5 py-4 lg:table-cell">
                                            <div className="h-4 w-36 rounded bg-slate-800" />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="h-5 w-16 rounded-full bg-slate-800" />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="ml-auto h-4 w-8 rounded bg-slate-800" />
                                        </td>
                                    </tr>
                                ))}
                            {!loading && data?.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-16 text-center text-slate-600"
                                    >
                                        <Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
                                        暂无下级企业
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                data?.data.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-b border-blue-900/20 transition-colors hover:bg-blue-600/5"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/15">
                                                    <Building2 className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <span className="font-medium text-slate-200">
                                                    {c.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden px-5 py-4 text-slate-400 md:table-cell">
                                            {c.enterprise_type?.title ?? '—'}
                                        </td>
                                        <td className="hidden px-5 py-4 font-mono text-xs text-slate-500 lg:table-cell">
                                            {c.credit_code ?? '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[c.status] ?? statusColors[2]}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${c.status === 1 ? 'bg-emerald-400' : 'bg-current'}`}
                                                />
                                                {c.status_str}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleView(c)}
                                                    className="inline-flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-400"
                                                >
                                                    查看
                                                    <ExternalLink className="h-3 w-3" />
                                                </button>
                                                {canUpdate && c.status !== 0 && (
                                                    <button
                                                        onClick={() =>
                                                            setToggleItem(c)
                                                        }
                                                        title={
                                                            c.status === 1
                                                                ? '停用企业'
                                                                : '启用企业'
                                                        }
                                                        className={cn(
                                                            'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                                                            c.status === 1
                                                                ? 'text-slate-600 hover:bg-amber-600/10 hover:text-amber-400'
                                                                : 'text-slate-600 hover:bg-emerald-600/10 hover:text-emerald-400',
                                                        )}
                                                    >
                                                        {c.status === 1 ? (
                                                            <PowerOff className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Power className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteItem(c)
                                                        }
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-red-600/10 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-blue-900/30 px-5 py-3">
                        <p className="text-xs text-slate-600">
                            第 {data.current_page} / {data.last_page} 页，共{' '}
                            {data.total} 条
                        </p>
                        <div className="flex items-center gap-1">
                            <PagBtn
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                icon={<ChevronLeft className="h-3.5 w-3.5" />}
                            />
                            <PagBtn
                                disabled={page >= data.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                icon={<ChevronRight className="h-3.5 w-3.5" />}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Create dialog */}
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            新增下级企业
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            填写基本信息后保存，企业将作为当前企业的直属下级
                        </p>
                    </div>
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {formError && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                {formError}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    企业名称{' '}
                                    <span className="ml-1 text-blue-500">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        set('title', e.target.value)
                                    }
                                    placeholder="企业全称"
                                    className={inputCls}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    统一社会信用代码
                                </label>
                                <input
                                    type="text"
                                    value={form.credit_code}
                                    onChange={(e) =>
                                        set('credit_code', e.target.value)
                                    }
                                    placeholder="18位统一社会信用代码"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    企业类型
                                </label>
                                <select
                                    value={form.enterprise_type_id}
                                    onChange={(e) =>
                                        set(
                                            'enterprise_type_id',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {enterpriseTypes.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            className="bg-[#0d1530]"
                                        >
                                            {t.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    经营类型
                                </label>
                                <select
                                    value={form.operational_type_id}
                                    onChange={(e) =>
                                        set(
                                            'operational_type_id',
                                            e.target.value,
                                        )
                                    }
                                    className={cn(
                                        inputCls,
                                        'cursor-pointer appearance-none',
                                    )}
                                >
                                    <option value="" className="bg-[#0d1530]">
                                        请选择
                                    </option>
                                    {operationalTypes.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            className="bg-[#0d1530]"
                                        >
                                            {t.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    地址
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) =>
                                        set('address', e.target.value)
                                    }
                                    placeholder="详细地址"
                                    className={inputCls}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    视图
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={form.is_produce}
                                            onChange={(e) =>
                                                set(
                                                    'is_produce',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500 focus:ring-1 focus:ring-blue-500/40"
                                        />
                                        生产视图
                                    </label>
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={form.is_bloc}
                                            onChange={(e) =>
                                                set('is_bloc', e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500 focus:ring-1 focus:ring-blue-500/40"
                                        />
                                        集团视图
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDialogOpen(false)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {formLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </Modal>

            {/* Admin credentials — one-time display */}
            <CredentialsModal
                credentials={credentials}
                onClose={() => setCredentials(null)}
            />

            {/* Toggle status confirm */}
            <Modal open={!!toggleItem} onClose={() => setToggleItem(null)}>
                <div className="p-6">
                    <div
                        className={cn(
                            'mb-4 flex h-11 w-11 items-center justify-center rounded-xl border',
                            toggleItem?.status === 1
                                ? 'border-amber-500/20 bg-amber-600/10'
                                : 'border-emerald-500/20 bg-emerald-600/10',
                        )}
                    >
                        {toggleItem?.status === 1 ? (
                            <PowerOff className="h-5 w-5 text-amber-400" />
                        ) : (
                            <Power className="h-5 w-5 text-emerald-400" />
                        )}
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        {toggleItem?.status === 1 ? '停用企业' : '启用企业'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要
                        {toggleItem?.status === 1 ? '停用' : '启用'} &ldquo;
                        <span className="font-medium text-slate-300">
                            {toggleItem?.title}
                        </span>
                        &rdquo; 吗？
                        {toggleItem?.status === 1 &&
                            '停用后该企业所有成员将无法登录。'}
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setToggleItem(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleToggle}
                        disabled={toggleLoading}
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50',
                            toggleItem?.status === 1
                                ? 'border-amber-500/30 bg-amber-600/15 text-amber-400 hover:bg-amber-600/25'
                                : 'border-emerald-500/30 bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25',
                        )}
                    >
                        {toggleLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {toggleLoading
                            ? '处理中...'
                            : toggleItem?.status === 1
                              ? '确认停用'
                              : '确认启用'}
                    </button>
                </div>
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        删除下级企业
                    </h2>
                    <p className="text-sm text-slate-500">
                        确定要删除 &ldquo;
                        <span className="font-medium text-slate-300">
                            {deleteItem?.title}
                        </span>
                        &rdquo; 吗？此操作不可撤销。
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button
                        onClick={() => setDeleteItem(null)}
                        className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {deleteLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {deleteLoading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}

function PagBtn({
    disabled,
    onClick,
    icon,
}: {
    disabled: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-900/40 bg-[#0a1428] text-slate-400 transition-colors hover:border-blue-500/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {icon}
        </button>
    );
}

function CredentialsModal({
    credentials,
    onClose,
}: {
    credentials: {
        companyTitle: string;
        username: string;
        password: string;
    } | null;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState<'username' | 'password' | null>(null);
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        if (!credentials) {
            setCopied(null);
            setAcknowledged(false);
        }
    }, [credentials]);

    if (!credentials) {
        return null;
    }

    const copy = async (text: string, which: 'username' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(which);
            setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
        } catch {
            // clipboard unavailable — user can still select+copy manually
        }
    };

    const download = () => {
        const content = [
            `企业名称：${credentials.companyTitle}`,
            `管理员账号：${credentials.username}`,
            `初始密码：${credentials.password}`,
            '',
            '请妥善保管此凭据。建议登录后立即修改密码。',
            `生成时间：${new Date().toLocaleString('zh-CN')}`,
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${credentials.username}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal open onClose={() => {}}>
            <div className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-600/10">
                    <KeyRound className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="mb-1 text-base font-semibold text-slate-100">
                    下级企业已创建
                </h2>
                <p className="mb-5 text-sm text-slate-500">
                    已为{' '}
                    <span className="font-medium text-slate-300">
                        {credentials.companyTitle}
                    </span>{' '}
                    自动生成管理员账号。
                </p>

                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-600/8 px-3 py-2.5 text-xs text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        此密码只显示一次，关闭后无法再次查看。请立即复制或下载保存。
                    </span>
                </div>

                <div className="space-y-3">
                    <CredentialRow
                        label="账号"
                        value={credentials.username}
                        copied={copied === 'username'}
                        onCopy={() => copy(credentials.username, 'username')}
                    />
                    <CredentialRow
                        label="密码"
                        value={credentials.password}
                        copied={copied === 'password'}
                        onCopy={() => copy(credentials.password, 'password')}
                    />
                </div>

                <button
                    onClick={download}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/20"
                >
                    <Download className="h-4 w-4" />
                    下载为 .txt 文件
                </button>

                <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                        className="h-4 w-4 rounded border-blue-900/40 bg-[#070d1f] text-blue-500 focus:ring-1 focus:ring-blue-500/40"
                    />
                    我已保存账号密码
                </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    disabled={!acknowledged}
                    className="rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/25 disabled:pointer-events-none disabled:opacity-40"
                >
                    完成
                </button>
            </div>
        </Modal>
    );
}

function CredentialRow({
    label,
    value,
    copied,
    onCopy,
}: {
    label: string;
    value: string;
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <div>
            <div className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2">
                <code className="flex-1 font-mono text-sm text-slate-200 break-all select-all">
                    {value}
                </code>
                <button
                    type="button"
                    onClick={onCopy}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-600/10 hover:text-blue-300"
                    title="复制"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
