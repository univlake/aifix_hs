import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, User, Role } from '@/types/models';

export default function UsersIndex() {
    const { data, loading, total, current_page, last_page, per_page, reload, goToPage, search } =
        useApiList<User>({ endpoint: '/users' });
    const crud = useApiCrud('/users');
    const [searchUsername, setSearchUsername] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [companies, setCompanies] = useState<{ id: number; title: string }[]>([]);

    const [form, setForm] = useState({
        username: '',
        password: '',
        nickname: '',
        company_id: '',
        phone: '',
        email: '',
        role: 'user',
        status: '1',
    });

    useEffect(() => {
        api.get<ApiResponse<Role[]>>('/roles').then((res) => setRoles(res.data.data)).catch(() => {});
        api.get<ApiResponse<{ data: { id: number; title: string }[] }>>('/companies', { params: { per_page: 100 } })
            .then((res) => setCompanies(res.data.data.data ?? []))
            .catch(() => {});
    }, []);

    const handleSearch = useCallback((val: string) => {
        setSearchUsername(val);
        search({ username: val || undefined });
    }, [search]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ username: '', password: '', nickname: '', company_id: '', phone: '', email: '', role: 'user', status: '1' });
        setDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingId(user.id);
        setForm({
            username: user.username,
            password: '',
            nickname: user.nickname,
            company_id: user.company_id ? String(user.company_id) : '',
            phone: user.phone ?? '',
            email: user.email ?? '',
            role: user.roles?.[0]?.name ?? 'user',
            status: String(user.status),
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        try {
            const payload: Record<string, unknown> = {
                ...form,
                company_id: form.company_id ? Number(form.company_id) : null,
                status: Number(form.status),
            };
            if (editingId && !form.password) delete payload.password;
            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }
            setDialogOpen(false);
            reload();
        } catch (err: any) {
            alert(err.response?.data?.message ?? '操作失败');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await crud.remove(deleteId);
        setDeleteId(null);
        reload();
    };

    const columns: ColumnDef<User>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'username', header: '用户名' },
        { accessorKey: 'nickname', header: '昵称' },
        {
            id: 'company',
            header: '所属企业',
            cell: ({ row }) => row.original.company?.title ?? '—',
        },
        {
            id: 'role',
            header: '角色',
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    {row.original.roles?.map((r) => (
                        <Badge key={r.id} variant="outline">{r.name}</Badge>
                    )) ?? '—'}
                </div>
            ),
        },
        {
            id: 'status',
            header: '状态',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 1 ? 'default' : 'destructive'}>
                    {row.original.status === 1 ? '启用' : '禁用'}
                </Badge>
            ),
        },
        { accessorKey: 'phone', header: '手机号' },
        {
            id: 'actions',
            header: '操作',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    const updateForm = (k: string, v: string | null) => setForm((f) => ({ ...f, [k]: v ?? '' }));

    return (
        <>
            <Head title="用户管理" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">用户管理</h1>
                    <p className="text-muted-foreground text-sm">共 {total} 个用户</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    新增用户
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索用户名..."
                searchValue={searchUsername}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '编辑用户' : '新增用户'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>用户名 *</Label>
                                <Input value={form.username} onChange={(e) => updateForm('username', e.target.value)} disabled={!!editingId} />
                            </div>
                            <div className="space-y-2">
                                <Label>昵称 *</Label>
                                <Input value={form.nickname} onChange={(e) => updateForm('nickname', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{editingId ? '新密码（留空不修改）' : '密码 *'}</Label>
                            <Input type="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>所属企业</Label>
                                <Select value={form.company_id ?? ''} onValueChange={(v) => updateForm('company_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="选择企业" /></SelectTrigger>
                                    <SelectContent>
                                        {companies.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>角色</Label>
                                <Select value={form.role ?? ''} onValueChange={(v) => updateForm('role', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>手机号</Label>
                                <Input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>邮箱</Label>
                                <Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                            </div>
                        </div>
                        {editingId && (
                            <div className="space-y-2">
                                <Label>状态</Label>
                                <Select value={form.status ?? ''} onValueChange={(v) => updateForm('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">启用</SelectItem>
                                        <SelectItem value="0">禁用</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button onClick={handleSubmit} disabled={formLoading}>{formLoading ? '保存中...' : '保存'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="删除用户"
                description="确定要删除该用户吗？此操作不可撤销。"
                onConfirm={handleDelete}
                loading={crud.loading}
            />
        </>
    );
}
