import { Head } from '@inertiajs/react';
import {
    AlertTriangle, Bell, CheckCircle2, Eye, FileCheck, FileText,
    Loader2, MessageSquare, Plus, Users, Wrench, X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AnnexUploadEditor, ConfirmRectificationModal, type DangerAnnexItem, RectifyModal } from '@/components/shared/HiddenDangerActionModals';
import { useScope } from '@/contexts/ScopeContext';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

interface InspectionRef {
    id: number;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    company_id?: number | null;
}

interface CheckCompanyRef {
    id: number;
    title: string;
}

interface NotifyItem {
    id: number;
    expert_inspection_id: number;
    check_company_id: number;
    notify_company_time: string | null;
    check_company_time: string | null;
    confirm_time: string | null;
    status: number;
    expert_inspection?: InspectionRef | null;
    expertInspection?: InspectionRef | null;
    check_company?: CheckCompanyRef | null;
    checkCompany?: CheckCompanyRef | null;
}

interface AnnexItem {
    id?: number;
    annex_url: string;
    geolocation?: string | null;
}

interface HiddenDanger {
    id: number;
    area: string;
    session: string;
    description: string;
    hidden_type: string;
    hidden_level: string;
    proposal: string | null;
    legalises: string | null;
    correct_deadline: string | null;
    correct_status: number;
    invest_status?: number;
    expert_inspection_id: number;
    expert_company_id: number;
    check_company_id?: number | null;
    zg_user_id?: number | null;
    /** 整改日期（复用 correct_date） */
    correct_date?: string | null;
    /** 整改描述（复用 review_description） */
    review_description?: string | null;
    /** 确认人 */
    review_user_id?: number | null;
    /** 确认时间 */
    review_time?: string | null;
    archive_user_id?: number | null;
    hidden_rectify_annex?: AnnexItem[];
    hiddenRectifyAnnex?: AnnexItem[];
    hidden_review_annex?: AnnexItem[];
    hiddenReviewAnnex?: AnnexItem[];
}

// ── Helpers ────────────────────────────────────────────────────────

function pickInspection(row: NotifyItem): InspectionRef | null {
    return row.expert_inspection ?? row.expertInspection ?? null;
}

function dangerStatusLabel(d: HiddenDanger): { text: string; cls: string } {
    if (d.invest_status === 2) {
        return { text: '已归档', cls: 'border-slate-600/40 bg-slate-700/20 text-slate-400' };
    }

    if (d.correct_status === 3 || d.review_time) {
        return { text: '已确认', cls: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400' };
    }

    if (d.correct_status === 2) {
        return { text: '已整改待确认', cls: 'border-blue-500/30 bg-blue-600/10 text-blue-400' };
    }

    return { text: '待整改', cls: 'border-amber-500/30 bg-amber-600/10 text-amber-400' };
}

// ── Dangers drawer ────────────────────────────────────────────────

function DangersDrawer({
    companyId, inspectionId, expertCompanyId, planCompanyId, role, onClose,
}: {
    companyId: number;
    inspectionId: number;
    expertCompanyId: number | null;
    planCompanyId: number | null;
    role: { isCheckedCompany: boolean; isExpert: boolean; isGroup: boolean };
    onClose: () => void;
}) {
    const [dangers, setDangers] = useState<HiddenDanger[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'dangers' | 'inspection-notice' | 'rectification-notice' | 'feedback'>('dangers');
    const [rectifyFor, setRectifyFor] = useState<HiddenDanger | null>(null);
    const [confirmFor, setConfirmFor] = useState<HiddenDanger | null>(null);
    const [addDangerOpen, setAddDangerOpen] = useState(false);
    const canRegister = role.isExpert && expertCompanyId !== null && planCompanyId !== null;

    const refresh = useCallback(async () => {
        setLoading(true);

        try {
            const res = await api.get<ApiResponse<PaginatedData<HiddenDanger>>>('/hidden-danger-infos', {
                params: { expert_inspection_id: inspectionId, check_company_id: companyId, per_page: 200 },
            });
            setDangers(res.data.data.data);
        } finally {
            setLoading(false);
        }
    }, [inspectionId, companyId]);

    useEffect(() => {
 refresh(); 
}, [refresh]);

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">检查详情</h2>
                        <p className="mt-0.5 text-xs text-slate-600">本次专家检查相关的隐患与通知</p>
                    </div>
                    <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0.5 border-b border-blue-900/30 px-6">
                    {([
                        { key: 'dangers', label: '隐患清单', icon: AlertTriangle },
                        { key: 'inspection-notice', label: '检查通知单', icon: FileText },
                        { key: 'rectification-notice', label: '整改通知单', icon: FileCheck },
                        { key: 'feedback', label: '反馈情况', icon: MessageSquare },
                    ] as const).map(({ key, label, icon: Icon }) => {
                        const active = tab === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={cn(
                                    'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition-colors',
                                    active ? 'border-blue-500 text-blue-300' : 'border-transparent text-slate-500 hover:text-slate-300',
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {tab === 'dangers' && (<>
                        {canRegister && (
                            <div className="mb-3 flex justify-end">
                                <button
                                    onClick={() => setAddDangerOpen(true)}
                                    className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-600/15 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-600/25"
                                >
                                    <Plus className="h-3.5 w-3.5" />登记隐患
                                </button>
                            </div>
                        )}
                        {loading ? (
                            <div className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" /></div>
                        ) : dangers.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-blue-900/30 py-12 text-center text-sm text-slate-600">暂无隐患记录</div>
                        ) : (
                            <div className="space-y-3">
                                {dangers.map((d) => {
                                    const status = dangerStatusLabel(d);
                                    const isArchived = d.invest_status === 2;
                                    const isConfirmed = d.correct_status === 3 || Boolean(d.review_time);
                                    const isRectified = d.correct_status === 2;
                                    const canRectify = !isArchived && !isConfirmed && (role.isCheckedCompany || role.isExpert);
                                    const canConfirm = !isArchived && isRectified && !isConfirmed && role.isExpert;

                                    return (
                                        <div key={d.id} className="rounded-lg border border-blue-900/30 bg-[#070d1f] p-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded border border-blue-900/40 bg-blue-600/8 px-1.5 py-0 text-[10px] text-blue-400">{d.hidden_type}</span>
                                                <span className={cn('rounded border px-1.5 py-0 text-[10px]', d.hidden_level === '重大隐患' ? 'border-red-500/30 bg-red-600/10 text-red-400' : 'border-blue-500/30 bg-blue-600/10 text-blue-400')}>{d.hidden_level}</span>
                                                <span className="text-xs text-slate-400">{d.area}</span>
                                                {d.correct_deadline && <span className="text-[11px] text-slate-500">整改期限：{d.correct_deadline}</span>}
                                                <span className={cn('ml-auto rounded border px-1.5 py-0 text-[10px]', status.cls)}>{status.text}</span>
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap text-slate-300">{d.description}</p>
                                            {d.proposal && (
                                                <div className="mt-2 border-t border-blue-900/20 pt-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">整改建议</p>
                                                    <p className="mt-0.5 text-xs text-slate-400">{d.proposal}</p>
                                                </div>
                                            )}
                                            {(isRectified || isConfirmed) && d.review_description && (
                                                <div className="mt-2 border-t border-blue-900/20 pt-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">整改内容</p>
                                                    <p className="mt-0.5 text-xs text-slate-400">{d.review_description}</p>
                                                    {d.correct_date && <p className="text-[11px] text-slate-600">整改日期：{d.correct_date}</p>}
                                                </div>
                                            )}
                                            {isConfirmed && (
                                                <div className="mt-2 border-t border-blue-900/20 pt-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">确认信息</p>
                                                    <p className="mt-0.5 text-xs text-slate-400">已确认整改{d.review_time ? ` · ${String(d.review_time).slice(0, 19).replace('T', ' ')}` : ''}</p>
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {(canRectify || canConfirm) && (
                                                <div className="mt-3 flex items-center gap-2 border-t border-blue-900/20 pt-2">
                                                    {canRectify && (
                                                        <button
                                                            onClick={() => setRectifyFor(d)}
                                                            className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-600/20"
                                                        >
                                                            <Wrench className="h-3 w-3" />
                                                            {isRectified ? '重新整改' : '隐患整改'}
                                                        </button>
                                                    )}
                                                    {canConfirm && (
                                                        <button
                                                            onClick={() => setConfirmFor(d)}
                                                            className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-600/20"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />整改确认
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>)}

                    {tab === 'inspection-notice' && (
                        <div className="py-12 text-center">
                            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-700" />
                            <p className="text-sm text-slate-400">检查通知单</p>
                            <p className="mt-1 text-xs text-slate-600">即将支持 · 查看集团下发的检查通知单</p>
                        </div>
                    )}

                    {tab === 'rectification-notice' && (
                        <div className="py-12 text-center">
                            <FileCheck className="mx-auto mb-3 h-10 w-10 text-slate-700" />
                            <p className="text-sm text-slate-400">整改通知单</p>
                            <p className="mt-1 text-xs text-slate-600">即将支持 · 查看集团下发的整改通知单</p>
                        </div>
                    )}

                    {tab === 'feedback' && (
                        <div className="py-12 text-center">
                            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-700" />
                            <p className="text-sm text-slate-400">反馈情况</p>
                            <p className="mt-1 text-xs text-slate-600">即将支持 · 记录整改过程中的反馈</p>
                        </div>
                    )}
                </div>
            </div>

            <RectifyModal
                open={rectifyFor !== null}
                danger={rectifyFor}
                onClose={() => setRectifyFor(null)}
                onSaved={() => {
 setRectifyFor(null); refresh(); 
}}
            />
            <ConfirmRectificationModal
                open={confirmFor !== null}
                danger={confirmFor}
                onClose={() => setConfirmFor(null)}
                onSaved={() => {
 setConfirmFor(null); refresh();
}}
            />
            {canRegister && (
                <RegisterDangerModal
                    open={addDangerOpen}
                    onClose={() => setAddDangerOpen(false)}
                    inspectionId={inspectionId}
                    expertCompanyId={expertCompanyId!}
                    checkCompanyId={companyId}
                    planCompanyId={planCompanyId!}
                    onSaved={() => {
                        setAddDangerOpen(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}

// ── Register-danger modal (expert side) ─────────────────────────

const HIDDEN_TYPE_OPTIONS = ['消防', '机械', '危化品', '职业健康', '电气', '基础管理', '三违'];
const HIDDEN_LEVEL_OPTIONS = ['一般隐患', '重大隐患'];
const dangerInputCls = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const dangerSelectCls = cn(dangerInputCls, 'cursor-pointer appearance-none');

interface DangerForm {
    area: string;
    session: string;
    description: string;
    hidden_type: string;
    hidden_level: string;
    legalises: string;
    proposal: string;
    correct_deadline: string;
}

const emptyDanger = (): DangerForm => ({
    area: '', session: '第一轮', description: '', hidden_type: '',
    hidden_level: '', legalises: '', proposal: '', correct_deadline: '',
});

function RegisterDangerModal({
    open, onClose, inspectionId, expertCompanyId, checkCompanyId, planCompanyId, onSaved,
}: {
    open: boolean;
    onClose: () => void;
    inspectionId: number;
    expertCompanyId: number;
    checkCompanyId: number;
    planCompanyId: number;
    onSaved: () => void;
}) {
    const [form, setForm] = useState<DangerForm>(emptyDanger());
    const [examineAnnex, setExamineAnnex] = useState<DangerAnnexItem[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(emptyDanger());
            setExamineAnnex([]);
            setError('');
        }
    }, [open]);

    if (!open) {
return null;
}

    const set = (k: keyof DangerForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.area || !form.description || !form.hidden_type || !form.hidden_level) {
            setError('请完整填写场所、描述、类别、等级');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/hidden-danger-infos', {
                expert_inspection_id: inspectionId,
                expert_company_id: expertCompanyId,
                check_company_id: checkCompanyId,
                area: form.area,
                session: form.session || '第一轮',
                description: form.description,
                hidden_type: form.hidden_type,
                hidden_level: form.hidden_level,
                legalises: form.legalises || null,
                proposal: form.proposal || null,
                correct_deadline: form.correct_deadline || null,
                company_id: planCompanyId,
                hiddenExamineAnnex: examineAnnex.filter((a) => a.annex_url),
            });
            onSaved();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">登记隐患</h2>
                        <p className="mt-0.5 text-xs text-slate-600">在本次检查中登记一条现场隐患</p>
                    </div>
                    <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="场所" required>
                                <input className={dangerInputCls} value={form.area} onChange={(e) => set('area', e.target.value)} />
                            </FormField>
                            <FormField label="次数">
                                <input className={dangerInputCls} value={form.session} onChange={(e) => set('session', e.target.value)} />
                            </FormField>
                            <FormField label="隐患类别" required>
                                <select className={dangerSelectCls} value={form.hidden_type} onChange={(e) => set('hidden_type', e.target.value)}>
                                    <option value="" className="bg-[#0d1530]">请选择</option>
                                    {HIDDEN_TYPE_OPTIONS.map((t) => <option key={t} value={t} className="bg-[#0d1530]">{t}</option>)}
                                </select>
                            </FormField>
                            <FormField label="隐患等级" required>
                                <select className={dangerSelectCls} value={form.hidden_level} onChange={(e) => set('hidden_level', e.target.value)}>
                                    <option value="" className="bg-[#0d1530]">请选择</option>
                                    {HIDDEN_LEVEL_OPTIONS.map((l) => <option key={l} value={l} className="bg-[#0d1530]">{l}</option>)}
                                </select>
                            </FormField>
                            <FormField label="整改截止期限">
                                <input type="date" className={cn(dangerInputCls, 'cursor-pointer')} value={form.correct_deadline} onChange={(e) => set('correct_deadline', e.target.value)} />
                            </FormField>
                        </div>
                        <FormField label="隐患描述" required>
                            <textarea className={cn(dangerInputCls, 'resize-none')} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                        </FormField>
                        <FormField label="排查依据">
                            <textarea className={cn(dangerInputCls, 'resize-none')} rows={2} value={form.legalises} onChange={(e) => set('legalises', e.target.value)} />
                        </FormField>
                        <FormField label="整改建议">
                            <textarea className={cn(dangerInputCls, 'resize-none')} rows={2} value={form.proposal} onChange={(e) => set('proposal', e.target.value)} />
                        </FormField>
                        <AnnexUploadEditor value={examineAnnex} onChange={setExamineAnnex} label="隐患排查附件" dir="hidden-danger/examine/" />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">取消</button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        保存隐患
                    </button>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}{required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

// ── Expert assigned inspections section ──────────────────────────

interface ExpertAssignment {
    id: number;
    expert_company_id: number;
    confirm_time: string | null;
    expert_company?: {
        id: number;
        expert_inspection_id: number;
        check_company_id: number;
        notify_company_time: string | null;
        check_company_time: string | null;
        check_company?: { id: number; title: string } | null;
        checkCompany?: { id: number; title: string } | null;
        expert_inspection?: InspectionRef | null;
        expertInspection?: InspectionRef | null;
    } | null;
    expertCompany?: ExpertAssignment['expert_company'];
}

function pickExpertCompany(row: ExpertAssignment) {
    return row.expert_company ?? row.expertCompany ?? null;
}

// ── Page ───────────────────────────────────────────────────────────

export default function ExpertInspectionCompanyView() {
    const { user } = useAuth();
    const { activeCompany } = useScope();
    const companyId = activeCompany?.id;

    const [items, setItems] = useState<NotifyItem[]>([]);
    const [history, setHistory] = useState<NotifyItem[]>([]);
    const [assignments, setAssignments] = useState<ExpertAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState<{ kind: 'company' | 'expert'; id: number } | null>(null);
    const [detail, setDetail] = useState<{
        companyId: number;
        inspectionId: number;
        expertCompanyId: number | null;
        planCompanyId: number | null;
        role: { isCheckedCompany: boolean; isExpert: boolean; isGroup: boolean };
    } | null>(null);
    const [error, setError] = useState('');

    const fetchAll = useCallback(async () => {
        if (!companyId) {
return;
}

        setLoading(true);
        setError('');

        try {
            const tasks: Promise<unknown>[] = [
                api.get<ApiResponse<NotifyItem[]>>('/expert-inspection-notifications/company', {
                    params: { company_id: companyId },
                }).then((res) => setItems(res.data.data ?? [])),
                api.get<ApiResponse<PaginatedData<NotifyItem>>>('/my-check-inspections', {
                    params: {
                        company_id: companyId,
                        ...(user?.id ? { expert_user_id: user.id } : {}),
                        per_page: 100,
                    },
                }).then((res) => setHistory(res.data.data.data ?? [])),
            ];

            if (user?.id) {
                tasks.push(
                    api.get<ApiResponse<PaginatedData<ExpertAssignment>>>('/my-expert-assignments', {
                        params: { expert_user_id: user.id, per_page: 100 },
                    }).then((res) => setAssignments(res.data.data.data ?? [])).catch(() => setAssignments([])),
                );
            }

            await Promise.all(tasks);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '加载失败');
        } finally {
            setLoading(false);
        }
    }, [companyId, user?.id]);

    useEffect(() => {
 fetchAll(); 
}, [fetchAll]);

    const confirmCompany = async (item: NotifyItem) => {
        setConfirming({ kind: 'company', id: item.id });

        try {
            await api.post(`/expert-inspection-companies/${item.id}/confirm`);
            fetchAll();
        } finally {
            setConfirming(null);
        }
    };

    const confirmExpert = async (item: ExpertAssignment) => {
        setConfirming({ kind: 'expert', id: item.id });

        try {
            await api.post(`/expert-inspection-users/${item.id}/confirm`);
            fetchAll();
        } finally {
            setConfirming(null);
        }
    };

    const openCompanyDetail = (row: NotifyItem) => {
        if (!companyId) {
return;
}

        const ins = pickInspection(row);

        setDetail({
            companyId,
            inspectionId: row.expert_inspection_id,
            expertCompanyId: row.id,
            planCompanyId: ins?.company_id ?? null,
            role: { isCheckedCompany: true, isExpert: false, isGroup: false },
        });
    };

    const openExpertDetail = (assignment: ExpertAssignment) => {
        const ec = pickExpertCompany(assignment);

        if (!ec) {
return;
}

        const ins = ec.expert_inspection ?? ec.expertInspection ?? null;

        setDetail({
            companyId: ec.check_company_id,
            inspectionId: ec.expert_inspection_id,
            expertCompanyId: ec.id,
            planCompanyId: ins?.company_id ?? null,
            role: { isCheckedCompany: false, isExpert: true, isGroup: false },
        });
    };

    const pendingExpertNotifs = assignments.filter((a) => !a.confirm_time);
    const confirmedAssignments = assignments.filter((a) => a.confirm_time);

    return (
        <>
            <Head title="专家检查" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-100">专家检查</h1>
                <p className="mt-0.5 text-xs text-slate-600">集团下达的专家现场检查任务与相关隐患清单</p>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                </div>
            )}

            {/* Pending notifications */}
            {(items.length > 0 || pendingExpertNotifs.length > 0) && (
                <section className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-400" />
                        <h2 className="text-sm font-semibold text-slate-200">待确认通知</h2>
                        <span className="rounded-full border border-amber-500/30 bg-amber-600/15 px-2 py-0.5 text-[10px] text-amber-400">{items.length + pendingExpertNotifs.length}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {items.map((item) => {
                            const ins = pickInspection(item);

                            return (
                                <div key={`c-${item.id}`} className="rounded-xl border border-amber-500/25 bg-amber-600/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3.5 w-3.5 text-amber-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_inspection_id}`}</p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">受检企业待确认 · 通知：{item.notify_company_time ?? '—'}</p>
                                        </div>
                                        <button
                                            onClick={() => confirmCompany(item)}
                                            disabled={confirming?.kind === 'company' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认</button>
                                    </div>
                                </div>
                            );
                        })}
                        {pendingExpertNotifs.map((item) => {
                            const ec = pickExpertCompany(item);
                            const ins = ec?.expert_inspection ?? ec?.expertInspection ?? null;
                            const cc = ec?.check_company ?? ec?.checkCompany ?? null;

                            return (
                                <div key={`e-${item.id}`} className="rounded-xl border border-blue-500/25 bg-blue-600/5 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-3.5 w-3.5 text-blue-400" />
                                                <p className="truncate text-sm font-semibold text-slate-100" title={ins?.title ?? ''}>{ins?.title ?? `检查#${item.expert_company_id}`}</p>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                指派专家检查 · {cc?.title ? `受检：${cc.title}` : '受检企业未指定'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => confirmExpert(item)}
                                            disabled={confirming?.kind === 'expert' && confirming?.id === item.id}
                                            className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-600/25 disabled:opacity-50"
                                        >确认</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Expert assignments */}
            {confirmedAssignments.length > 0 && (
                <section className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-200">我的专家检查任务</h2>
                        <span className="text-[11px] text-slate-600">共 {confirmedAssignments.length} 条</span>
                    </div>
                    <div className="space-y-2">
                        {confirmedAssignments.map((a) => {
                            const ec = pickExpertCompany(a);
                            const ins = ec?.expert_inspection ?? ec?.expertInspection ?? null;
                            const cc = ec?.check_company ?? ec?.checkCompany ?? null;

                            return (
                                <div key={a.id} className="flex items-center justify-between rounded-lg border border-blue-900/30 bg-[#070d1f] px-4 py-3 text-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-slate-200">{ins?.title ?? `检查#${ec?.expert_inspection_id ?? ''}`}</p>
                                        <p className="mt-0.5 text-[11px] text-slate-500">受检企业：{cc?.title ?? '—'}</p>
                                    </div>
                                    <button
                                        onClick={() => openExpertDetail(a)}
                                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
                                    >
                                        <Eye className="h-3.5 w-3.5" />进入检查
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Company history */}
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-200">相关检查记录</h2>
                    <span className="text-[11px] text-slate-600">共 {history.length} 条</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                                {['检查主题', '受检企业', '通知时间', '计划检查时间', '确认时间', '状态', '操作'].map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && history.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" /></td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-600">暂无记录</td></tr>
                            ) : history.map((row) => {
                                const ins = pickInspection(row);
                                const cc = row.check_company ?? row.checkCompany ?? null;

                                return (
                                    <tr key={row.id} className="border-b border-blue-900/20 last:border-0 transition-colors hover:bg-white/[0.02]">
                                        <td className="max-w-[240px] truncate px-4 py-2.5 text-slate-200" title={ins?.title ?? ''}>{ins?.title ?? `检查#${row.expert_inspection_id}`}</td>
                                        <td className="max-w-[200px] truncate px-4 py-2.5 text-xs text-slate-400" title={cc?.title ?? ''}>{cc?.title ?? <span className="text-slate-700">—</span>}</td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">{row.notify_company_time ?? <span className="text-slate-700">—</span>}</td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">{row.check_company_time ?? <span className="text-slate-700">—</span>}</td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400">{row.confirm_time ?? <span className="text-slate-700">—</span>}</td>
                                        <td className="px-4 py-2.5">
                                            {row.confirm_time
                                                ? <span className="rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400">已确认</span>
                                                : <span className="rounded-md border border-amber-500/30 bg-amber-600/10 px-2 py-0.5 text-[10px] text-amber-400">待确认</span>}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <button
                                                onClick={() => openCompanyDetail(row)}
                                                className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
                                            >
                                                <Eye className="h-3.5 w-3.5" />检查详情
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {detail && (
                <DangersDrawer
                    companyId={detail.companyId}
                    inspectionId={detail.inspectionId}
                    expertCompanyId={detail.expertCompanyId}
                    planCompanyId={detail.planCompanyId}
                    role={detail.role}
                    onClose={() => setDetail(null)}
                />
            )}

        </>
    );
}
