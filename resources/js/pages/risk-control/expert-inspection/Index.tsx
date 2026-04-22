import { Head } from '@inertiajs/react';
import {
    Archive, AlertTriangle, BarChart3, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye,
    FileCheck, FileDown, FileSpreadsheet, Image as ImageIcon, Loader2, Pencil, Plus,
    Trash2, UserCheck, Users, X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AnnexUploadEditor, ConfirmRectificationModal, type DangerAnnexItem } from '@/components/shared/HiddenDangerActionModals';
import { useScope } from '@/contexts/ScopeContext';
import { useApiCrud } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedData } from '@/types/models';

// ── Types ──────────────────────────────────────────────────────────

interface ExpertUser {
    id: number;
    nickname: string;
    phone?: string | null;
}

interface CheckCompany {
    id: number;
    title: string;
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
    legalises?: string | null;
    proposal?: string | null;
    correct_deadline?: string | null;
    correct_status: number;
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
    /** 归档人（复用 archive_user_id） */
    archive_user_id?: number | null;
    invest_status?: number;
    hidden_examine_annex?: AnnexItem[];
    hiddenExamineAnnex?: AnnexItem[];
    hidden_review_annex?: AnnexItem[];
    hiddenReviewAnnex?: AnnexItem[];
    hidden_rectify_annex?: AnnexItem[];
    hiddenRectifyAnnex?: AnnexItem[];
}

interface ExpertInspectionUserRow {
    id: number;
    expert_user_id: number;
    expert_company_id: number;
    status: number;
    confirm_time: string | null;
    comment?: string | null;
    expert_user?: ExpertUser | null;
    expertUser?: ExpertUser | null;
}

interface ExpertCompanyRow {
    id: number;
    expert_inspection_id: number;
    check_company_id: number;
    notify_company_time: string | null;
    check_company_time: string | null;
    confirm_time: string | null;
    inspection_notice_url: string | null;
    rectification_sheet_url: string | null;
    status: number;
    check_company?: CheckCompany | null;
    checkCompany?: CheckCompany | null;
    expert_inspection_users?: ExpertInspectionUserRow[];
    expertInspectionUsers?: ExpertInspectionUserRow[];
}

interface Inspection {
    id: number;
    title: string;
    description: string | null;
    comment: string | null;
    start_date: string | null;
    end_date: string | null;
    company_id: number;
    created_at: string;
    expert_companies?: ExpertCompanyRow[];
    expertCompanies?: ExpertCompanyRow[];
}

interface CompanyOption {
    id: number;
    title: string;
}

interface BlocExpertRow {
    id: number;
    expert_user_id: number;
    user: ExpertUser;
}

// ── Constants ──────────────────────────────────────────────────────

const HIDDEN_TYPE_OPTIONS = ['危化品', '电气', '机械', '安全设施', '消防', '职业卫生', '其他'];
const HIDDEN_LEVEL_OPTIONS = ['一般隐患', '重大隐患'];

const inputCls = 'w-full rounded-lg border border-blue-900/40 bg-[#070d1f] px-3 py-2 text-sm text-slate-200 placeholder-slate-700 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20';
const selectCls = cn(inputCls, 'cursor-pointer appearance-none');

function pickCheckCompany(row: ExpertCompanyRow): CheckCompany | null {
    return row.check_company ?? row.checkCompany ?? null;
}

function pickExpertUser(row: ExpertInspectionUserRow): ExpertUser | null {
    return row.expert_user ?? row.expertUser ?? null;
}

function pickCompanies(ins: Inspection): ExpertCompanyRow[] {
    return ins.expert_companies ?? ins.expertCompanies ?? [];
}

function pickUsers(row: ExpertCompanyRow): ExpertInspectionUserRow[] {
    return row.expert_inspection_users ?? row.expertInspectionUsers ?? [];
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

function isActive(ins: Inspection): boolean {
    if (!ins.end_date) {
return true;
}

    // compare dates (ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(ins.end_date);
    end.setHours(0, 0, 0, 0);

    return end.getTime() >= today.getTime();
}

// ── Modal ──────────────────────────────────────────────────────────

function Modal({
    open, onClose, size = 'md', children,
}: { open: boolean; onClose: () => void; size?: 'md' | 'lg' | 'xl'; children: React.ReactNode }) {
    if (!open) {
return null;
}

    const widthCls = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60', widthCls)}>
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
    return (
        <div className="flex items-center justify-between border-b border-blue-900/30 px-6 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-100">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ── Plan form ──────────────────────────────────────────────────────

interface PlanForm {
    title: string;
    description: string;
    comment: string;
    start_date: string;
    end_date: string;
}

const emptyPlan = (): PlanForm => ({ title: '', description: '', comment: '', start_date: '', end_date: '' });

function planFromRow(row: Inspection): PlanForm {
    return {
        title: row.title ?? '',
        description: row.description ?? '',
        comment: row.comment ?? '',
        start_date: row.start_date ?? '',
        end_date: row.end_date ?? '',
    };
}

function PlanModal({
    open, editing, onClose, onSaved, companyId,
}: {
    open: boolean;
    editing: Inspection | null;
    onClose: () => void;
    onSaved: () => void;
    companyId: number;
}) {
    const crud = useApiCrud('/expert-inspections');
    const [form, setForm] = useState<PlanForm>(emptyPlan());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(editing ? planFromRow(editing) : emptyPlan());
            setError('');
        }
    }, [open, editing]);

    const set = (k: keyof PlanForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.title.trim()) {
            setError('请输入检查主题');

            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: Record<string, unknown> = {
                title: form.title,
                description: form.description || null,
                comment: form.comment || null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
            };

            if (!editing) {
payload.company_id = companyId;
}

            if (editing) {
await crud.update(editing.id, payload);
} else {
await crud.create(payload);
}

            onSaved();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title={editing ? '编辑专家检查计划' : '新增专家检查计划'}
                subtitle="集团端专家现场检查任务管理"
                onClose={onClose}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </div>
                    )}
                    <Field label="检查主题" required>
                        <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="例如：Q2 专家安全检查" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="开始日期">
                            <input type="date" className={cn(inputCls, 'cursor-pointer')} value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
                        </Field>
                        <Field label="结束日期">
                            <input type="date" className={cn(inputCls, 'cursor-pointer')} value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
                        </Field>
                    </div>
                    <Field label="检查内容介绍">
                        <textarea className={cn(inputCls, 'resize-none')} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="本次检查的内容、目标等" />
                    </Field>
                    <Field label="备注">
                        <textarea className={cn(inputCls, 'resize-none')} rows={2} value={form.comment} onChange={(e) => set('comment', e.target.value)} />
                    </Field>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">取消</button>
                <button
                    onClick={submit}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {loading ? '保存中...' : '保存'}
                </button>
            </div>
        </Modal>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}{required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

// ── Add company modal ─────────────────────────────────────────────

function AddCompanyModal({
    open, onClose, inspection, onSaved, rootCompanyId,
}: {
    open: boolean;
    onClose: () => void;
    inspection: Inspection | null;
    onSaved: () => void;
    rootCompanyId: number;
}) {
    const [options, setOptions] = useState<CompanyOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState('');
    const [notifyTime, setNotifyTime] = useState('');
    const [checkTime, setCheckTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !rootCompanyId) {
return;
}

        setLoading(true);
        api.get<ApiResponse<PaginatedData<CompanyOption>>>('/companies', { params: { pid: rootCompanyId, per_page: 500 } })
            .then((res) => setOptions(res.data.data.data))
            .finally(() => setLoading(false));
        setSelected('');
        setNotifyTime('');
        setCheckTime('');
        setError('');
    }, [open, rootCompanyId]);

    const submit = async () => {
        if (!inspection) {
return;
}

        if (!selected) {
            setError('请选择受检企业');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/expert-inspection-companies', {
                expert_inspection_id: inspection.id,
                check_company_id: Number(selected),
                company_id: rootCompanyId,
                notify_company_time: notifyTime || null,
                check_company_time: checkTime || null,
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
        <Modal open={open} onClose={onClose}>
            <ModalHeader title="添加受检企业" subtitle="选择下属企业并设置通知/检查时间" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                        </div>
                    )}
                    <Field label="受检企业" required>
                        <select className={selectCls} value={selected} onChange={(e) => setSelected(e.target.value)}>
                            <option value="" className="bg-[#0d1530]">{loading ? '加载中...' : '请选择'}</option>
                            {options.map((c) => <option key={c.id} value={c.id} className="bg-[#0d1530]">{c.title}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="通知企业时间">
                            <input type="datetime-local" className={cn(inputCls, 'cursor-pointer')} value={notifyTime} onChange={(e) => setNotifyTime(e.target.value)} />
                        </Field>
                        <Field label="计划检查时间">
                            <input type="datetime-local" className={cn(inputCls, 'cursor-pointer')} value={checkTime} onChange={(e) => setCheckTime(e.target.value)} />
                        </Field>
                    </div>
                    <p className="text-xs text-slate-600">通知企业时间到达后，被选企业的仪表板将显示该检查通知；企业确认后自动记录确认时间。</p>
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
                    确认添加
                </button>
            </div>
        </Modal>
    );
}

// ── Add expert modal ─────────────────────────────────────────────

function AddExpertModal({
    open, onClose, expertCompany, onSaved, rootCompanyId,
}: {
    open: boolean;
    onClose: () => void;
    expertCompany: ExpertCompanyRow | null;
    onSaved: () => void;
    rootCompanyId: number;
}) {
    const [options, setOptions] = useState<BlocExpertRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !rootCompanyId) {
return;
}

        setLoading(true);
        api.get<ApiResponse<PaginatedData<BlocExpertRow>>>('/bloc-experts', { params: { company_id: rootCompanyId, per_page: 500 } })
            .then((res) => setOptions(res.data.data.data))
            .finally(() => setLoading(false));
        setSelected('');
        setError('');
    }, [open, rootCompanyId]);

    const submit = async () => {
        if (!expertCompany) {
return;
}

        if (!selected) {
            setError('请选择专家');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/expert-inspection-users', {
                expert_user_id: Number(selected),
                expert_company_id: expertCompany.id,
                company_id: rootCompanyId,
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
        <Modal open={open} onClose={onClose}>
            <ModalHeader title="指派检查专家" subtitle="专家将在仪表板收到检查通知" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                        </div>
                    )}
                    <Field label="选择专家" required>
                        <select className={selectCls} value={selected} onChange={(e) => setSelected(e.target.value)}>
                            <option value="" className="bg-[#0d1530]">{loading ? '加载中...' : '请选择'}</option>
                            {options.map((o) => (
                                <option key={o.id} value={o.expert_user_id} className="bg-[#0d1530]">
                                    {o.user?.nickname ?? `专家#${o.expert_user_id}`}
                                    {o.user?.phone ? ` · ${o.user.phone}` : ''}
                                </option>
                            ))}
                        </select>
                    </Field>
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
                    确认指派
                </button>
            </div>
        </Modal>
    );
}

// ── Hidden danger modal ──────────────────────────────────────────

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

function DangerModal({
    open, onClose, expertCompany, inspectionId, onSaved, rootCompanyId,
}: {
    open: boolean;
    onClose: () => void;
    expertCompany: ExpertCompanyRow | null;
    inspectionId: number | null;
    onSaved: () => void;
    rootCompanyId: number;
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

    const set = (k: keyof DangerForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!expertCompany || !inspectionId) {
return;
}

        if (!form.area || !form.description || !form.hidden_type || !form.hidden_level) {
            setError('请完整填写场所、描述、类别、等级');

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.post('/hidden-danger-infos', {
                expert_inspection_id: inspectionId,
                expert_company_id: expertCompany.id,
                check_company_id: expertCompany.check_company_id,
                area: form.area,
                session: form.session || '第一轮',
                description: form.description,
                hidden_type: form.hidden_type,
                hidden_level: form.hidden_level,
                legalises: form.legalises || null,
                proposal: form.proposal || null,
                correct_deadline: form.correct_deadline || null,
                company_id: rootCompanyId,
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
        <Modal open={open} onClose={onClose} size="lg">
            <ModalHeader title="新增隐患记录" subtitle="针对该受检企业登记现场隐患" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="场所" required>
                            <input className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)} />
                        </Field>
                        <Field label="次数">
                            <input className={inputCls} value={form.session} onChange={(e) => set('session', e.target.value)} />
                        </Field>
                        <Field label="隐患类别" required>
                            <select className={selectCls} value={form.hidden_type} onChange={(e) => set('hidden_type', e.target.value)}>
                                <option value="" className="bg-[#0d1530]">请选择</option>
                                {HIDDEN_TYPE_OPTIONS.map((t) => <option key={t} value={t} className="bg-[#0d1530]">{t}</option>)}
                            </select>
                        </Field>
                        <Field label="隐患等级" required>
                            <select className={selectCls} value={form.hidden_level} onChange={(e) => set('hidden_level', e.target.value)}>
                                <option value="" className="bg-[#0d1530]">请选择</option>
                                {HIDDEN_LEVEL_OPTIONS.map((l) => <option key={l} value={l} className="bg-[#0d1530]">{l}</option>)}
                            </select>
                        </Field>
                        <Field label="整改截止期限">
                            <input type="date" className={cn(inputCls, 'cursor-pointer')} value={form.correct_deadline} onChange={(e) => set('correct_deadline', e.target.value)} />
                        </Field>
                    </div>
                    <Field label="隐患描述" required>
                        <textarea className={cn(inputCls, 'resize-none')} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                    </Field>
                    <Field label="排查依据">
                        <textarea className={cn(inputCls, 'resize-none')} rows={2} value={form.legalises} onChange={(e) => set('legalises', e.target.value)} />
                    </Field>
                    <Field label="整改建议">
                        <textarea className={cn(inputCls, 'resize-none')} rows={2} value={form.proposal} onChange={(e) => set('proposal', e.target.value)} />
                    </Field>
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
        </Modal>
    );
}

// ── Detail drawer ─────────────────────────────────────────────────

function DetailDrawer({
    inspection, canEdit, userId, onClose, onChanged, rootCompanyId,
}: {
    inspection: Inspection;
    canEdit: boolean;
    userId: number | null;
    onClose: () => void;
    onChanged: () => void;
    rootCompanyId: number;
}) {
    const [companies, setCompanies] = useState<ExpertCompanyRow[]>([]);
    const [dangers, setDangers] = useState<HiddenDanger[]>([]);
    const [loading, setLoading] = useState(false);
    const [addCompanyOpen, setAddCompanyOpen] = useState(false);
    const [addExpertFor, setAddExpertFor] = useState<ExpertCompanyRow | null>(null);
    const [addDangerFor, setAddDangerFor] = useState<ExpertCompanyRow | null>(null);
    const [confirmFor, setConfirmFor] = useState<HiddenDanger | null>(null);
    const [archiving, setArchiving] = useState<number | null>(null);
    const [generatingNotice, setGeneratingNotice] = useState<number | null>(null);
    const [generatingSheet, setGeneratingSheet] = useState<number | null>(null);
    const [viewingDanger, setViewingDanger] = useState<HiddenDanger | null>(null);

    const isPlanOwner = inspection.company_id === rootCompanyId;

    const refresh = useCallback(async () => {
        setLoading(true);

        try {
            const [companiesRes, dangersRes] = await Promise.all([
                api.get<ApiResponse<PaginatedData<ExpertCompanyRow>>>('/expert-inspection-companies', {
                    params: { expert_inspection_id: inspection.id, per_page: 100 },
                }),
                api.get<ApiResponse<PaginatedData<HiddenDanger>>>('/hidden-danger-infos', {
                    params: { expert_inspection_id: inspection.id, per_page: 200 },
                }),
            ]);
            setCompanies(companiesRes.data.data.data);
            setDangers(dangersRes.data.data.data);
        } finally {
            setLoading(false);
        }
    }, [inspection.id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const removeCompany = async (c: ExpertCompanyRow) => {
        if (!window.confirm('确定要删除该受检企业记录吗？')) {
return;
}

        await api.delete(`/expert-inspection-companies/${c.id}`);
        refresh();
        onChanged();
    };

    const removeExpert = async (u: ExpertInspectionUserRow) => {
        if (!window.confirm('确定要移除该专家吗？')) {
return;
}

        await api.delete(`/expert-inspection-users/${u.id}`);
        refresh();
    };


    const generateNotice = async (ec: ExpertCompanyRow) => {
        setGeneratingNotice(ec.id);

        try {
            await api.post(`/expert-inspection-companies/${ec.id}/inspection-notice`);
            await refresh();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            window.alert(e?.response?.data?.message ?? '生成失败');
        } finally {
            setGeneratingNotice(null);
        }
    };

    const downloadNotice = async (ec: ExpertCompanyRow) => {
        try {
            const res = await api.get(`/expert-inspection-companies/${ec.id}/inspection-notice`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `检查通知单-${pickCheckCompany(ec)?.title ?? ec.id}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            window.alert(e?.response?.data?.message ?? '下载失败');
        }
    };

    const generateSheet = async (ec: ExpertCompanyRow) => {
        setGeneratingSheet(ec.id);

        try {
            await api.post(`/expert-inspection-companies/${ec.id}/rectification-sheet`);
            await refresh();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            window.alert(e?.response?.data?.message ?? '生成失败');
        } finally {
            setGeneratingSheet(null);
        }
    };

    const downloadSheet = async (ec: ExpertCompanyRow) => {
        try {
            const res = await api.get(`/expert-inspection-companies/${ec.id}/rectification-sheet`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `整改通知单-${pickCheckCompany(ec)?.title ?? ec.id}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            window.alert(e?.response?.data?.message ?? '下载失败');
        }
    };

    const archiveDanger = async (d: HiddenDanger) => {
        if (!window.confirm('确认对该隐患进行归档？归档后将不可再修改。')) {
return;
}

        setArchiving(d.id);

        try {
            await api.post(`/hidden-danger-infos/${d.id}/archive`);
            refresh();
        } finally {
            setArchiving(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex justify-end">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-blue-900/50 bg-[#0d1530] shadow-2xl shadow-black/60">
                    <div className="flex items-start justify-between border-b border-blue-900/30 px-6 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">{inspection.title}</h2>
                            <p className="mt-0.5 text-xs text-slate-600">
                                {inspection.start_date ?? '—'} 至 {inspection.end_date ?? '—'}
                                {!canEdit && <span className="ml-2 rounded border border-slate-700/40 bg-slate-700/20 px-1.5 py-0.5 text-[10px] text-slate-500">已结束</span>}
                            </p>
                        </div>
                        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {inspection.description && (
                            <section className="mb-5 rounded-lg border border-blue-900/20 bg-[#070d1f] px-4 py-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">检查说明</p>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{inspection.description}</p>
                            </section>
                        )}

                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">受检企业 ({companies.length})</p>
                                {canEdit && (
                                    <button
                                        onClick={() => setAddCompanyOpen(true)}
                                        className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-600/15 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-600/25"
                                    >
                                        <Plus className="h-3 w-3" />添加企业
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" /></div>
                            ) : companies.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-blue-900/30 py-8 text-center text-xs text-slate-600">暂无受检企业</div>
                            ) : (
                                <div className="space-y-3">
                                    {companies.map((c) => {
                                        const co = pickCheckCompany(c);
                                        const experts = pickUsers(c);
                                        const ds = dangers.filter((d) => d.check_company_id === c.check_company_id);
                                        const isExpertOnRow = userId !== null && experts.some((u) => u.expert_user_id === userId);
                                        const canAddDanger = isActive(inspection) && (canEdit || isExpertOnRow);

                                        const canDownloadNoticeRow = Boolean(c.inspection_notice_url) && (isPlanOwner || isExpertOnRow);
                                        const canGenerateSheetRow = isPlanOwner || isExpertOnRow;

                                        return (
                                            <div key={c.id} className="overflow-hidden rounded-xl border border-blue-900/30 bg-[#070d1f]">
                                                {/* Header: name + status + action toolbar */}
                                                <div className="flex items-center gap-2 border-b border-blue-900/20 bg-blue-950/25 px-3 py-2">
                                                    <Users className="h-4 w-4 shrink-0 text-blue-400" />
                                                    <p className="truncate text-sm font-medium text-slate-200">{co?.title ?? `企业#${c.check_company_id}`}</p>
                                                    {c.confirm_time ? (
                                                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-600/10 px-1.5 text-[10px] text-emerald-400">
                                                            <CheckCircle2 className="h-2.5 w-2.5" />已确认
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-600/10 px-1.5 text-[10px] text-amber-400">
                                                            <Clock className="h-2.5 w-2.5" />待确认
                                                        </span>
                                                    )}
                                                    <div className="ml-auto flex items-center gap-0.5">
                                                        {isPlanOwner && (
                                                            <button
                                                                onClick={() => generateNotice(c)}
                                                                disabled={generatingNotice === c.id}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-blue-400 transition-colors hover:bg-blue-600/15 disabled:opacity-50"
                                                                title={c.inspection_notice_url ? '重新生成通知单' : '生成通知单'}
                                                            >
                                                                {generatingNotice === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                                                            </button>
                                                        )}
                                                        {canDownloadNoticeRow && (
                                                            <button
                                                                onClick={() => downloadNotice(c)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-400 transition-colors hover:bg-emerald-600/15"
                                                                title="下载通知单"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        {canGenerateSheetRow && (
                                                            <button
                                                                onClick={() => generateSheet(c)}
                                                                disabled={generatingSheet === c.id}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-amber-400 transition-colors hover:bg-amber-600/15 disabled:opacity-50"
                                                                title={c.rectification_sheet_url ? '重新生成整改单' : '生成整改单'}
                                                            >
                                                                {generatingSheet === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                                                            </button>
                                                        )}
                                                        {c.rectification_sheet_url && (
                                                            <button
                                                                onClick={() => downloadSheet(c)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-violet-400 transition-colors hover:bg-violet-600/15"
                                                                title="下载整改单"
                                                            >
                                                                <FileCheck className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => removeCompany(c)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-600/15 hover:text-red-400"
                                                                title="删除受检企业"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="space-y-3 p-3">
                                                    {/* Compact meta */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />通知 {c.notify_company_time ?? '—'}</span>
                                                        <span className="text-slate-700">·</span>
                                                        <span>检查 {c.check_company_time ?? '—'}</span>
                                                        {c.confirm_time && <><span className="text-slate-700">·</span><span className="text-emerald-500/80">确认 {c.confirm_time}</span></>}
                                                    </div>

                                                    {/* Experts — inline chip row */}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-[11px] text-slate-600">专家：</span>
                                                        {experts.length === 0 && <span className="text-[11px] text-slate-700">暂无</span>}
                                                        {experts.map((u) => {
                                                            const user = pickExpertUser(u);

                                                            return (
                                                                <span key={u.id} className="group inline-flex items-center gap-1 rounded-md border border-blue-900/40 bg-blue-600/5 px-2 py-0.5 text-[11px] text-slate-300">
                                                                    {user?.nickname ?? `专家#${u.expert_user_id}`}
                                                                    {u.confirm_time ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> : <Clock className="h-2.5 w-2.5 text-amber-400" />}
                                                                    {canEdit && (
                                                                        <button onClick={() => removeExpert(u)} className="ml-0.5 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400">
                                                                            <X className="h-2.5 w-2.5" />
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            );
                                                        })}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => setAddExpertFor(c)}
                                                                className="inline-flex items-center gap-1 rounded-md border border-dashed border-blue-900/50 px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:border-blue-500/40 hover:text-blue-300"
                                                                title="指派专家"
                                                            >
                                                                <UserCheck className="h-2.5 w-2.5" />指派
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Dangers */}
                                                    <div>
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="text-[11px] text-slate-600">现场隐患 <span className="text-slate-500">({ds.length})</span></span>
                                                            {canAddDanger && (
                                                                <button
                                                                    onClick={() => setAddDangerFor(c)}
                                                                    className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-600/10 px-2 py-0.5 text-[10px] text-amber-400 transition-colors hover:bg-amber-600/20"
                                                                >
                                                                    <AlertTriangle className="h-2.5 w-2.5" />登记隐患
                                                                </button>
                                                            )}
                                                        </div>
                                                        {ds.length === 0 ? (
                                                            <p className="rounded border border-dashed border-blue-900/30 py-2 text-center text-[11px] text-slate-700">暂无隐患</p>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                {ds.map((d) => {
                                                                    const status = dangerStatusLabel(d);
                                                                    const isArchived = d.invest_status === 2;
                                                                    const isConfirmed = d.correct_status === 3 || Boolean(d.review_time);
                                                                    const isRectified = d.correct_status === 2;

                                                                    return (
                                                                        <div
                                                                            key={d.id}
                                                                            onClick={() => setViewingDanger(d)}
                                                                            className="group cursor-pointer rounded-md border border-blue-900/20 bg-[#0d1530] px-2.5 py-2 text-[11px] transition-colors hover:border-blue-500/40 hover:bg-blue-950/40"
                                                                        >
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="rounded border border-blue-900/40 bg-blue-600/8 px-1.5 py-0 text-[10px] text-blue-400">{d.hidden_type}</span>
                                                                                <span className={cn('rounded border px-1.5 py-0 text-[10px]', d.hidden_level === '重大隐患' ? 'border-red-500/30 bg-red-600/10 text-red-400' : 'border-blue-500/30 bg-blue-600/10 text-blue-400')}>{d.hidden_level}</span>
                                                                                <span className="text-slate-500">{d.area}</span>
                                                                                <span className={cn('ml-auto rounded border px-1.5 py-0 text-[10px]', status.cls)}>{status.text}</span>
                                                                                <Eye className="h-3 w-3 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
                                                                            </div>
                                                                            <p className="mt-1 text-slate-400 line-clamp-2" title={d.description}>{d.description}</p>
                                                                            {(isRectified || isConfirmed) && d.review_description && (
                                                                                <p className="mt-1 text-[10px] text-slate-500">
                                                                                    <span className="text-slate-600">整改：</span>{d.review_description}
                                                                                    {d.correct_date && <span className="ml-1 text-slate-700">· {d.correct_date}</span>}
                                                                                </p>
                                                                            )}
                                                                            {!isArchived && (isRectified || (isConfirmed && isPlanOwner)) && (
                                                                                <div className="mt-1.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                                                    {isRectified && !isConfirmed && (
                                                                                        <button
                                                                                            onClick={() => setConfirmFor(d)}
                                                                                            className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-600/20"
                                                                                        >
                                                                                            <CheckCircle2 className="h-2.5 w-2.5" />整改确认
                                                                                        </button>
                                                                                    )}
                                                                                    {isConfirmed && isPlanOwner && (
                                                                                        <button
                                                                                            onClick={() => archiveDanger(d)}
                                                                                            disabled={archiving === d.id}
                                                                                            className="flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-600/10 px-2 py-0.5 text-[10px] text-violet-300 hover:bg-violet-600/20 disabled:opacity-50"
                                                                                        >
                                                                                            {archiving === d.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Archive className="h-2.5 w-2.5" />}
                                                                                            确认归档
                                                                                        </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <AddCompanyModal
                open={addCompanyOpen}
                onClose={() => setAddCompanyOpen(false)}
                inspection={inspection}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
 setAddCompanyOpen(false); refresh(); onChanged(); 
}}
            />
            <AddExpertModal
                open={addExpertFor !== null}
                onClose={() => setAddExpertFor(null)}
                expertCompany={addExpertFor}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
 setAddExpertFor(null); refresh(); 
}}
            />
            <DangerModal
                open={addDangerFor !== null}
                onClose={() => setAddDangerFor(null)}
                expertCompany={addDangerFor}
                inspectionId={inspection.id}
                rootCompanyId={rootCompanyId}
                onSaved={() => {
 setAddDangerFor(null); refresh(); 
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
            <DangerDetailsModal danger={viewingDanger} onClose={() => setViewingDanger(null)} />
        </>
    );
}

// ── Danger details modal ──────────────────────────────────────────

function pickExamineAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_examine_annex ?? d.hiddenExamineAnnex ?? [];
}
function pickRectifyAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_rectify_annex ?? d.hiddenRectifyAnnex ?? [];
}
function pickReviewAnnex(d: HiddenDanger): AnnexItem[] {
    return d.hidden_review_annex ?? d.hiddenReviewAnnex ?? [];
}

function isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
}

function AnnexGallery({ items }: { items: AnnexItem[] }) {
    if (items.length === 0) {
        return <p className="rounded border border-dashed border-blue-900/30 py-3 text-center text-[11px] text-slate-700">暂无附件</p>;
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {items.map((a, i) => (
                <a
                    key={a.id ?? i}
                    href={a.annex_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-md border border-blue-900/30 bg-[#070d1f]"
                    title={a.geolocation ?? undefined}
                >
                    {isImageUrl(a.annex_url) ? (
                        <img src={a.annex_url} alt="" className="h-24 w-full object-cover transition-opacity group-hover:opacity-80" />
                    ) : (
                        <div className="flex h-24 w-full flex-col items-center justify-center gap-1 px-2 text-[10px] text-slate-500">
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                            <span className="w-full truncate text-center">{a.annex_url.split('/').pop() ?? '附件'}</span>
                        </div>
                    )}
                    {a.geolocation && <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-slate-300">📍 {a.geolocation}</span>}
                </a>
            ))}
        </div>
    );
}

function DangerDetailsModal({ danger, onClose }: { danger: HiddenDanger | null; onClose: () => void }) {
    if (!danger) {
return null;
}

    const status = dangerStatusLabel(danger);
    const examineAnnex = pickExamineAnnex(danger);
    const rectifyAnnex = pickRectifyAnnex(danger);
    const reviewAnnex = pickReviewAnnex(danger);

    return (
        <Modal open={true} onClose={onClose} size="lg">
            <ModalHeader title="隐患详情" subtitle={`${danger.hidden_type} · ${danger.area}`} onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-blue-900/40 bg-blue-600/10 px-2 py-0.5 text-[11px] text-blue-400">{danger.hidden_type}</span>
                        <span className={cn('rounded border px-2 py-0.5 text-[11px]', danger.hidden_level === '重大隐患' ? 'border-red-500/30 bg-red-600/10 text-red-400' : 'border-blue-500/30 bg-blue-600/10 text-blue-400')}>{danger.hidden_level}</span>
                        <span className={cn('rounded border px-2 py-0.5 text-[11px]', status.cls)}>{status.text}</span>
                        {danger.session && <span className="rounded border border-blue-900/40 bg-[#070d1f] px-2 py-0.5 text-[11px] text-slate-400">第 {danger.session}</span>}
                    </div>

                    {/* Description */}
                    <section className="rounded-lg border border-blue-900/30 bg-[#070d1f] px-4 py-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">隐患描述</p>
                        <p className="whitespace-pre-wrap text-sm text-slate-200">{danger.description}</p>
                        <p className="mt-2 text-[11px] text-slate-500">场所：{danger.area}</p>
                    </section>

                    {/* Examination */}
                    <section>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">排查信息</p>
                        <div className="space-y-3 rounded-lg border border-blue-900/30 bg-[#070d1f] px-4 py-3">
                            {danger.correct_deadline && (
                                <div className="text-[11px] text-slate-400">
                                    <span className="text-slate-600">整改期限：</span>{danger.correct_deadline}
                                </div>
                            )}
                            {danger.legalises && (
                                <div>
                                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">排查依据</p>
                                    <p className="whitespace-pre-wrap text-xs text-slate-300">{danger.legalises}</p>
                                </div>
                            )}
                            {danger.proposal && (
                                <div>
                                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">整改建议</p>
                                    <p className="whitespace-pre-wrap text-xs text-slate-300">{danger.proposal}</p>
                                </div>
                            )}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">排查附件</p>
                                <AnnexGallery items={examineAnnex} />
                            </div>
                        </div>
                    </section>

                    {/* Rectification */}
                    {(danger.correct_date || danger.review_description || rectifyAnnex.length > 0) && (
                        <section>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80">整改情况</p>
                            <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-600/5 px-4 py-3">
                                {danger.correct_date && (
                                    <div className="text-[11px] text-slate-400">
                                        <span className="text-slate-600">整改日期：</span>{danger.correct_date}
                                    </div>
                                )}
                                {danger.review_description && (
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">整改描述</p>
                                        <p className="whitespace-pre-wrap text-xs text-slate-300">{danger.review_description}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">整改附件</p>
                                    <AnnexGallery items={rectifyAnnex} />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Confirmation */}
                    {(danger.review_time || reviewAnnex.length > 0) && (
                        <section>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-violet-400/80">确认复查</p>
                            <div className="space-y-3 rounded-lg border border-violet-500/20 bg-violet-600/5 px-4 py-3">
                                {danger.review_time && (
                                    <div className="text-[11px] text-slate-400">
                                        <span className="text-slate-600">确认时间：</span>{danger.review_time}
                                    </div>
                                )}
                                <div>
                                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">复查附件</p>
                                    <AnnexGallery items={reviewAnnex} />
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end border-t border-blue-900/30 px-6 py-4">
                <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">关闭</button>
            </div>
        </Modal>
    );
}

// ── Page ──────────────────────────────────────────────────────────

export default function ExpertInspectionGroupView({ mode = 'admin' }: { mode?: 'admin' | 'production' }) {
    const { rootCompany, activeCompany } = useScope();
    const { user } = useAuth();
    const isProduction = mode === 'production';
    const companyId = (isProduction ? activeCompany?.id : rootCompany?.id) ?? undefined;

    const [rows, setRows] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [planOpen, setPlanOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Inspection | null>(null);
    const [detail, setDetail] = useState<Inspection | null>(null);
    const [deleteItem, setDeleteItem] = useState<Inspection | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    const fetchRows = useCallback(async (p: number, title: string) => {
        if (!companyId && !user?.id) {
            return;
        }

        setLoading(true);

        try {
            const res = await api.get<ApiResponse<PaginatedData<Inspection>>>('/expert-inspections', {
                params: {
                    ...(companyId ? { company_id: companyId } : {}),
                    ...(user?.id ? { expert_user_id: user.id } : {}),
                    page: p,
                    per_page: 15,
                    ...(title ? { title } : {}),
                },
            });
            setRows(res.data.data.data);
            setLastPage(res.data.data.last_page);
            setTotal(res.data.data.total);
        } finally {
            setLoading(false);
        }
    }, [companyId, user?.id]);

    useEffect(() => {
        setPage(1);
        fetchRows(1, search);
    }, [companyId, user?.id, search, fetchRows]);

    const handlePage = (p: number) => {
        setPage(p);
        fetchRows(p, search);
    };

    const openCreate = () => {
        setEditingPlan(null);
        setPlanOpen(true);
    };

    const openEdit = (row: Inspection) => {
        setEditingPlan(row);
        setPlanOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteItem) {
return;
}

        setDeleting(true);

        try {
            await api.delete(`/expert-inspections/${deleteItem.id}`);
            setDeleteItem(null);
            fetchRows(page, search);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Head title="专家检查" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">专家检查</h1>
                    <p className="mt-0.5 text-xs text-slate-600">
                        {isProduction ? '查看本企业相关的专家检查计划' : '集团端专家现场安全检查任务管理'} · 共 <span className="font-medium text-slate-400">{total}</span> 条记录
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {companyId && !isProduction && (
                        <button
                            onClick={() => setStatsModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-400/50 hover:bg-emerald-600/25 active:scale-95"
                        >
                            <BarChart3 className="h-4 w-4" />导出隐患分类统计
                        </button>
                    )}
                    {companyId && !isProduction && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-600/25 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />新建检查计划
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
                <input
                    className={cn(inputCls, 'max-w-xs')}
                    placeholder="搜索检查主题..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
 if (e.key === 'Enter') {
setSearch(searchInput.trim());
} 
}}
                />
                <button
                    onClick={() => setSearch(searchInput.trim())}
                    className="rounded-lg border border-blue-900/40 px-3 py-2 text-xs text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >搜索</button>
                {search && (
                    <button
                        onClick={() => {
 setSearchInput(''); setSearch(''); 
}}
                        className="rounded-lg border border-blue-900/40 px-3 py-2 text-xs text-slate-500 hover:text-slate-300"
                    >清除</button>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-blue-900/30">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-900/30 bg-[#070d1f]">
                            {['检查主题', '开始日期', '结束日期', '受检企业', '状态', '操作'].map((h, i) => (
                                <th key={i} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" /></td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-600">暂无检查计划</td></tr>
                        ) : rows.map((row) => {
                            const active = isActive(row);
                            const companiesCount = pickCompanies(row).length;

                            return (
                                <tr key={row.id} className="border-b border-blue-900/20 last:border-0 transition-colors hover:bg-white/[0.02]">
                                    <td className="max-w-[240px] truncate px-4 py-2.5 text-slate-200" title={row.title}>{row.title}</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-400">{row.start_date ?? <span className="text-slate-700">—</span>}</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-400">{row.end_date ?? <span className="text-slate-700">—</span>}</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-400">{companiesCount}</td>
                                    <td className="px-4 py-2.5">
                                        {active
                                            ? <span className="rounded-md border border-emerald-500/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400">进行中</span>
                                            : <span className="rounded-md border border-slate-600/40 bg-slate-700/20 px-2 py-0.5 text-[10px] text-slate-500">已结束</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-0.5">
                                            <button onClick={() => setDetail(row)} className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-blue-400 transition-colors hover:bg-blue-600/10 hover:text-blue-300">
                                                <Eye className="h-3.5 w-3.5" />详情
                                            </button>
                                            {active && (
                                                <>
                                                    <button onClick={() => openEdit(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-blue-600/10 hover:text-blue-400" title="编辑">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => setDeleteItem(row)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-red-600/10 hover:text-red-400" title="删除">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button onClick={() => handlePage(page - 1)} disabled={page <= 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-500">{page} / {lastPage}</span>
                    <button onClick={() => handlePage(page + 1)} disabled={page >= lastPage} className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-900/40 text-slate-400 hover:border-blue-500/40 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            <PlanModal
                open={planOpen}
                editing={editingPlan}
                onClose={() => setPlanOpen(false)}
                companyId={companyId ?? 0}
                onSaved={() => {
 setPlanOpen(false); fetchRows(page, search); 
}}
            />

            {detail && (
                <DetailDrawer
                    inspection={detail}
                    canEdit={isActive(detail) && detail.company_id === companyId}
                    userId={user?.id ?? null}
                    rootCompanyId={companyId ?? 0}
                    onClose={() => setDetail(null)}
                    onChanged={() => fetchRows(page, search)}
                />
            )}

            <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">删除检查计划</h2>
                    <p className="text-sm text-slate-500">该操作将同时失去对相关受检企业、专家与隐患的关联视图。确定删除？</p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                    <button onClick={() => setDeleteItem(null)} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">取消</button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/25 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        确认删除
                    </button>
                </div>
            </Modal>

            {companyId && (
                <HazardStatsModal
                    open={statsModalOpen}
                    onClose={() => setStatsModalOpen(false)}
                    companyId={companyId}
                />
            )}
        </>
    );
}

// ── Hazard statistics export modal ────────────────────────────────

const HAZARD_STATS_TYPES = ['危化品', '电气', '机械', '安全设施', '消防', '职业健康', '其他'];

function HazardStatsModal({
    open, onClose, companyId,
}: { open: boolean; onClose: () => void; companyId: number }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('all');
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setStartTime('');
            setEndTime('');
            setType('all');
            setError('');
        }
    }, [open]);

    const submit = async () => {
        setExporting(true);
        setError('');

        try {
            const res = await api.get('/hazard-statistics', {
                params: {
                    company_id: companyId,
                    ...(startTime ? { start_time: startTime } : {}),
                    ...(endTime ? { end_time: endTime } : {}),
                    ...(type && type !== 'all' ? { type } : {}),
                },
                responseType: 'blob',
            });
            const blob = new Blob([res.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `隐患分类统计-${startTime || '全部'}-${endTime || '至今'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
            onClose();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e?.response?.data?.message ?? '导出失败');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader title="导出隐患分类统计" subtitle="按时间区间与类别导出本企业隐患排查分类统计表" onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/8 px-3 py-2.5 text-xs text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="开始日期">
                            <input type="date" className={cn(inputCls, 'cursor-pointer')} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </Field>
                        <Field label="结束日期">
                            <input type="date" className={cn(inputCls, 'cursor-pointer')} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </Field>
                    </div>
                    <Field label="隐患类别">
                        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="all" className="bg-[#0d1530]">全部类别</option>
                            {HAZARD_STATS_TYPES.map((t) => <option key={t} value={t} className="bg-[#0d1530]">{t}</option>)}
                        </select>
                    </Field>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button onClick={onClose} className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200">取消</button>
                <button
                    onClick={submit}
                    disabled={exporting}
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />}
                    导出
                </button>
            </div>
        </Modal>
    );
}
