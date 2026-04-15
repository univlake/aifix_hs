import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, Role, Permission } from '@/types/models';

export default function RolesIndex() {
    const { data, loading, total, reload } = useApiList<Role>({ endpoint: '/roles' });
    const crud = useApiCrud('/roles');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({});

    const [form, setForm] = useState({
        name: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        api.get<ApiResponse<{ list: Permission[]; grouped: Record<string, Permission[]> }>>('/permissions')
            .then((res) => setAllPermissions(res.data.data.grouped))
            .catch(() => {});
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', permissions: [] });
        setDialogOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditingId(role.id);
        setForm({
            name: role.name,
            permissions: role.permissions?.map((p) => p.name) ?? [],
        });
        setDialogOpen(true);
    };

    const togglePermission = (permName: string) => {
        setForm((f) => ({
            ...f,
            permissions: f.permissions.includes(permName)
                ? f.permissions.filter((p) => p !== permName)
                : [...f.permissions, permName],
        }));
    };

    const toggleModule = (module: string) => {
        const modulePerms = allPermissions[module]?.map((p) => p.name) ?? [];
        const allSelected = modulePerms.every((p) => form.permissions.includes(p));
        setForm((f) => ({
            ...f,
            permissions: allSelected
                ? f.permissions.filter((p) => !modulePerms.includes(p))
                : [...new Set([...f.permissions, ...modulePerms])],
        }));
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        try {
            if (editingId) {
                await crud.update(editingId, form);
            } else {
                await crud.create(form);
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
        try {
            await crud.remove(deleteId);
            setDeleteId(null);
            reload();
        } catch (err: any) {
            alert(err.response?.data?.message ?? '删除失败');
        }
    };

    const columns: ColumnDef<Role>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'name', header: '角色名称' },
        {
            id: 'permissions',
            header: '权限数量',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.permissions?.length ?? 0}</Badge>
            ),
        },
        { accessorKey: 'guard_name', header: 'Guard' },
        {
            id: 'actions',
            header: '操作',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    {row.original.name !== 'super-admin' && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            {!['super-admin', 'admin', 'user'].includes(row.original.name) && (
                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="角色管理" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">角色管理</h1>
                    <p className="text-muted-foreground text-sm">共 {total} 个角色</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    新增角色
                </Button>
            </div>

            <DataTable columns={columns} data={data} isLoading={loading} />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '编辑角色' : '新增角色'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>角色名称 *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                disabled={editingId ? ['super-admin', 'admin', 'user'].includes(form.name) : false}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>权限分配</Label>
                            <ScrollArea className="h-[400px] rounded-md border p-4">
                                {Object.entries(allPermissions).map(([module, perms]) => {
                                    const modulePerms = perms.map((p) => p.name);
                                    const allSelected = modulePerms.every((p) => form.permissions.includes(p));
                                    const someSelected = modulePerms.some((p) => form.permissions.includes(p));
                                    return (
                                        <div key={module} className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={() => toggleModule(module)}
                                                />
                                                <span className="font-semibold text-sm">{module}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {form.permissions.filter((p) => modulePerms.includes(p)).length}/{perms.length}
                                                </Badge>
                                            </div>
                                            <div className="ml-6 grid grid-cols-2 gap-1">
                                                {perms.map((perm) => (
                                                    <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <Checkbox
                                                            checked={form.permissions.includes(perm.name)}
                                                            onCheckedChange={() => togglePermission(perm.name)}
                                                        />
                                                        <span className="truncate">{perm.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button onClick={handleSubmit} disabled={formLoading}>
                            {formLoading ? '保存中...' : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="删除角色"
                description="确定要删除该角色吗？此操作不可撤销。"
                onConfirm={handleDelete}
                loading={crud.loading}
            />
        </>
    );
}
