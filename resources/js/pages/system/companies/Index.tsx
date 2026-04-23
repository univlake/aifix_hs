import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useApiList, useApiCrud } from '@/hooks/use-api';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse, Company } from '@/types/models';

const statusMap: Record<
    number,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    0: { label: '待审核', variant: 'secondary' },
    1: { label: '已启用', variant: 'default' },
    2: { label: '已禁用', variant: 'destructive' },
};

export default function CompaniesIndex() {
    const {
        data,
        loading,
        total,
        current_page,
        last_page,
        per_page,
        reload,
        goToPage,
        search,
    } = useApiList<Company>({ endpoint: '/companies' });
    const crud = useApiCrud('/companies');
    const { canWrite } = usePermission();
    const canCreate = canWrite('companies.create');
    const canUpdate = canWrite('companies.update');
    const canDelete = canWrite('companies.delete');
    const [searchTitle, setSearchTitle] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [enterpriseTypes, setEnterpriseTypes] = useState<
        { id: number; title: string }[]
    >([]);

    // Form state
    const [form, setForm] = useState({
        title: '',
        enterprise_type_id: '',
        operational_type_id: '',
        address: '',
        credit_code: '',
        supervise_name: '',
        supervise_tel: '',
        pid: '',
        is_produce: '0',
        is_bloc: '0',
    });

    useEffect(() => {
        api.get<ApiResponse<{ data: { id: number; title: string }[] }>>(
            '/enterprise-types',
            {
                params: { per_page: 100 },
            },
        )
            .then((res) => setEnterpriseTypes(res.data.data.data ?? []))
            .catch(() => {});
    }, []);

    const handleSearch = useCallback(
        (val: string) => {
            setSearchTitle(val);
            search({ title: val || undefined });
        },
        [search],
    );

    const openCreate = () => {
        setEditingId(null);
        setForm({
            title: '',
            enterprise_type_id: '',
            operational_type_id: '',
            address: '',
            credit_code: '',
            supervise_name: '',
            supervise_tel: '',
            pid: '',
            is_produce: '0',
            is_bloc: '0',
        });
        setDialogOpen(true);
    };

    const openEdit = (company: Company) => {
        setEditingId(company.id);
        setForm({
            title: company.title ?? '',
            enterprise_type_id: company.enterprise_type_id
                ? String(company.enterprise_type_id)
                : '',
            operational_type_id: company.operational_type_id
                ? String(company.operational_type_id)
                : '',
            address: company.address ?? '',
            credit_code: company.credit_code ?? '',
            supervise_name: company.supervise_name ?? '',
            supervise_tel: company.supervise_tel ?? '',
            pid: company.pid ? String(company.pid) : '',
            is_produce: String(company.is_produce ?? 0),
            is_bloc: String(company.is_bloc ?? 0),
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);

        try {
            const payload = {
                ...form,
                enterprise_type_id: form.enterprise_type_id
                    ? Number(form.enterprise_type_id)
                    : null,
                operational_type_id: form.operational_type_id
                    ? Number(form.operational_type_id)
                    : null,
                pid: form.pid ? Number(form.pid) : 0,
                is_produce: Number(form.is_produce),
                is_bloc: Number(form.is_bloc),
            };

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }

            setDialogOpen(false);
            reload();
        } catch (err: unknown) {
            alert(getErrorMessage(err, '操作失败'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) {
            return;
        }

        await crud.remove(deleteId);
        setDeleteId(null);
        reload();
    };

    const baseColumns: ColumnDef<Company>[] = [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'title', header: '企业名称' },
        {
            id: 'enterprise_type',
            header: '企业类型',
            cell: ({ row }) => row.original.enterprise_type?.title ?? '—',
        },
        {
            id: 'status',
            header: '状态',
            cell: ({ row }) => {
                const s = statusMap[row.original.status] ?? {
                    label: '未知',
                    variant: 'outline' as const,
                };

                return <Badge variant={s.variant}>{s.label}</Badge>;
            },
        },
        { accessorKey: 'supervise_name', header: '安全负责人' },
        { accessorKey: 'supervise_tel', header: '联系电话' },
    ];

    const columns: ColumnDef<Company>[] =
        canUpdate || canDelete
            ? [
                  ...baseColumns,
                  {
                      id: 'actions',
                      header: '操作',
                      cell: ({ row }) => (
                          <div className="flex gap-1">
                              {canUpdate && (
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEdit(row.original)}
                                  >
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                              )}
                              {canDelete && (
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeleteId(row.original.id)}
                                  >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              )}
                          </div>
                      ),
                  },
              ]
            : baseColumns;

    const updateForm = (key: string, value: string | null) =>
        setForm((f) => ({ ...f, [key]: value ?? '' }));

    return (
        <>
            <Head title="企业管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">企业管理</h1>
                    <p className="text-sm text-muted-foreground">
                        共 {total} 家企业
                    </p>
                </div>
                {canCreate && (
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增企业
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                searchPlaceholder="搜索企业名称..."
                searchValue={searchTitle}
                onSearchChange={handleSearch}
                pagination={{ current_page, last_page, per_page, total }}
                onPageChange={goToPage}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? '编辑企业' : '新增企业'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>企业名称 *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) =>
                                    updateForm('title', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>企业类型</Label>
                                <Select
                                    value={form.enterprise_type_id ?? ''}
                                    onValueChange={(v) =>
                                        updateForm('enterprise_type_id', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enterpriseTypes.map((t) => (
                                            <SelectItem
                                                key={t.id}
                                                value={String(t.id)}
                                            >
                                                {t.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>统一信用代码</Label>
                                <Input
                                    value={form.credit_code}
                                    onChange={(e) =>
                                        updateForm(
                                            'credit_code',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>地址</Label>
                            <Input
                                value={form.address}
                                onChange={(e) =>
                                    updateForm('address', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>安全负责人</Label>
                                <Input
                                    value={form.supervise_name}
                                    onChange={(e) =>
                                        updateForm(
                                            'supervise_name',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>联系电话</Label>
                                <Input
                                    value={form.supervise_tel}
                                    onChange={(e) =>
                                        updateForm(
                                            'supervise_tel',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>是否生产企业</Label>
                                <Select
                                    value={form.is_produce ?? ''}
                                    onValueChange={(v) =>
                                        updateForm('is_produce', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">否</SelectItem>
                                        <SelectItem value="1">是</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>是否集团</Label>
                                <Select
                                    value={form.is_bloc ?? ''}
                                    onValueChange={(v) =>
                                        updateForm('is_bloc', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">否</SelectItem>
                                        <SelectItem value="1">是</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            取消
                        </Button>
                        <Button onClick={handleSubmit} disabled={formLoading}>
                            {formLoading ? '保存中...' : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="删除企业"
                description="确定要删除该企业吗？此操作不可撤销。"
                onConfirm={handleDelete}
                loading={crud.loading}
            />
        </>
    );
}
