import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useScope } from '@/contexts/ScopeContext';
import { useApiCrud } from '@/hooks/use-api';
import { usePermission } from '@/hooks/use-permission';
import api from '@/lib/api';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { FilterSelect } from './components';
import { DetailPanel } from './drawers/DetailPanel';
import { InvestigationList } from './InvestigationList';
import { DeleteInvestigationModal } from './modals/DeleteInvestigationModal';
import { InvestigationFormModal } from './modals/InvestigationFormModal';
import {
    emptyForm,
    type FormState,
    type Investigation,
    LEVEL_OPTIONS,
    rowToForm,
    TYPE_OPTIONS,
} from './types';

export default function BlocMonthlyInvestigationIndex() {
    const { activeCompany, rootCompany } = useScope();
    const companyId = activeCompany?.id;
    const myCompanyId = rootCompany?.id;
    const { canWrite } = usePermission();
    const canCreate = canWrite('monthly-investigations.create');

    const [rows, setRows] = useState<Investigation[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [detail, setDetail] = useState<Investigation | null>(null);

    const crud = useApiCrud('/monthly-investigations');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteItem, setDeleteItem] = useState<Investigation | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState<FormState>(emptyForm());

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 8 }, (_, i) =>
        String(currentYear - i),
    );

    const fetchRows = async (
        p: number,
        type: string,
        level: string,
        year: string,
    ) => {
        if (!companyId) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<
                ApiResponse<PaginatedData<Investigation>>
            >('/bloc-monthly-investigations', {
                params: {
                    company_id: companyId,
                    page: p,
                    per_page: 15,
                    ...(type ? { type } : {}),
                    ...(level ? { level } : {}),
                    ...(year ? { inv_year: year } : {}),
                },
            });
            const meta = res.data.data;
            setRows(meta.data);
            setLastPage(meta.last_page);
            setTotal(meta.total);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchRows(1, filterType, filterLevel, filterYear);
    }, [companyId, filterType, filterLevel, filterYear]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePage = (p: number) => {
        setPage(p);
        fetchRows(p, filterType, filterLevel, filterYear);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (row: Investigation) => {
        setEditingId(row.id);
        setFormError('');
        setForm(rowToForm(row));
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!myCompanyId) {
            return;
        }

        setFormLoading(true);
        setFormError('');

        try {
            const payload: Record<string, unknown> = {
                type: form.type || null,
                level: form.level || null,
                is_fire_fighting: Number(form.is_fire_fighting),
                is_emergency: Number(form.is_emergency),
                inv_time: form.inv_time || null,
                inv_name: form.inv_name || null,
                content: form.content || null,
                legalbasis: form.legalbasis || null,
                proposal: form.proposal || null,
                correct_date: form.correct_date || null,
                correct_result: form.correct_result || null,
                is_govern: Number(form.is_govern),
                govern_title: form.govern_title || null,
                govern_user: form.govern_user || null,
                govern_date: form.govern_date || null,
                govern_money: form.govern_money || null,
                govern_supplies: form.govern_supplies || null,
                govern_text: form.govern_text || null,
                review_user: form.review_user || null,
                review_date: form.review_date || null,
                review_discription: form.review_discription || null,
                review_content: form.review_content || null,
                monthlyInvestigationReviews:
                    form.monthlyInvestigationReviews.filter((r) => r.annex_url),
                monthlyInvestigationViews:
                    form.monthlyInvestigationViews.filter((r) => r.annex_url),
            };

            if (!editingId) {
                payload.company_id = myCompanyId;
            }

            if (editingId) {
                await crud.update(editingId, payload);
            } else {
                await crud.create(payload);
            }

            setDialogOpen(false);
            fetchRows(page, filterType, filterLevel, filterYear);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setFormError(e?.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) {
            return;
        }

        await crud.remove(deleteItem.id);
        setDeleteItem(null);
        fetchRows(page, filterType, filterLevel, filterYear);
    };

    return (
        <>
            <Head title="隐患管理" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        隐患管理
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        当前企业及下属企业月度排查隐患汇总 · 共{' '}
                        <span className="font-medium text-slate-400">
                            {total}
                        </span>{' '}
                        条记录
                    </p>
                </div>
                {myCompanyId && canCreate && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        新增隐患
                    </button>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <FilterSelect
                    value={filterYear}
                    onChange={setFilterYear}
                    options={yearOptions}
                    placeholder="全部年份"
                />
                <FilterSelect
                    value={filterType}
                    onChange={setFilterType}
                    options={TYPE_OPTIONS}
                    placeholder="全部隐患类型"
                />
                <FilterSelect
                    value={filterLevel}
                    onChange={setFilterLevel}
                    options={LEVEL_OPTIONS}
                    placeholder="全部等级"
                />
            </div>

            <InvestigationList
                rows={rows}
                loading={loading}
                page={page}
                lastPage={lastPage}
                myCompanyId={myCompanyId}
                onView={setDetail}
                onEdit={openEdit}
                onDelete={setDeleteItem}
                onPage={handlePage}
            />

            {detail && (
                <DetailPanel row={detail} onClose={() => setDetail(null)} />
            )}

            <InvestigationFormModal
                open={dialogOpen}
                editing={!!editingId}
                form={form}
                setForm={setForm}
                formLoading={formLoading}
                formError={formError}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
            />

            <DeleteInvestigationModal
                open={!!deleteItem}
                loading={crud.loading}
                onCancel={() => setDeleteItem(null)}
                onConfirm={handleDelete}
            />
        </>
    );
}
