import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import type { ApiResponse, PaginatedData } from '@/types/models';
import { Field, Modal, ModalHeader, selectCls } from '../components';
import type { CompanyOption, Inspection } from '../types';

export function AddCompanyModal({
    open,
    onClose,
    inspection,
    onSaved,
    rootCompanyId,
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
        api.get<ApiResponse<PaginatedData<CompanyOption>>>('/companies', {
            params: { pid: rootCompanyId, per_page: 500 },
        })
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
            setError(getErrorMessage(err, '操作失败'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title="添加受检企业"
                subtitle="选择下属企业并设置通知/检查时间"
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
                    <Field label="受检企业" required>
                        <select
                            className={selectCls}
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                        >
                            <option value="" className="bg-[#0d1530]">
                                {loading ? '加载中...' : '请选择'}
                            </option>
                            {options.map((c) => (
                                <option
                                    key={c.id}
                                    value={c.id}
                                    className="bg-[#0d1530]"
                                >
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="通知企业时间">
                            <DateTimePicker
                                value={notifyTime}
                                onChange={setNotifyTime}
                            />
                        </Field>
                        <Field label="计划检查时间">
                            <DateTimePicker
                                value={checkTime}
                                onChange={setCheckTime}
                            />
                        </Field>
                    </div>
                    <p className="text-xs text-slate-600">
                        通知企业时间到达后，被选企业的仪表板将显示该检查通知；企业确认后自动记录确认时间。
                    </p>
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
                    确认添加
                </button>
            </div>
        </Modal>
    );
}
