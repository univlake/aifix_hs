import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { Field, Modal, ModalHeader, selectCls } from '../components';
import type { BlocExpertRow, ExpertCompanyRow } from '../types';

export function AddExpertModal({
    open,
    onClose,
    expertCompany,
    onSaved,
    rootCompanyId,
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
        api.get<ApiResponse<PaginatedData<BlocExpertRow>>>('/bloc-experts', {
            params: { company_id: rootCompanyId, per_page: 500 },
        })
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
            setError(getErrorMessage(err, '操作失败'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title="指派检查专家"
                subtitle="专家将在仪表板收到检查通知"
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
                    <Field label="选择专家" required>
                        <select
                            className={selectCls}
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                        >
                            <option value="" className="bg-[#0d1530]">
                                {loading ? '加载中...' : '请选择'}
                            </option>
                            {options.map((o) => (
                                <option
                                    key={o.id}
                                    value={o.expert_user_id}
                                    className="bg-[#0d1530]"
                                >
                                    {o.user?.nickname ??
                                        `专家#${o.expert_user_id}`}
                                    {o.user?.phone ? ` · ${o.user.phone}` : ''}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-900/30 px-6 py-4">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-blue-900/40 px-4 py-2 text-sm text-slate-400 hover:border-blue-500/40 hover:text-slate-200"
                >
                    取消
                </button>
                <button
                    onClick={submit}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {submitting && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    确认指派
                </button>
            </div>
        </Modal>
    );
}
