import { AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/shared/DatePicker';
import api from '@/lib/api';
import { getErrorMessage } from '@/types/api-error';
import { Field, Modal, ModalHeader, selectCls } from '../components';
import { HAZARD_STATS_TYPES } from '../types';

export function HazardStatsModal({
    open,
    onClose,
    companyId,
}: {
    open: boolean;
    onClose: () => void;
    companyId: number;
}) {
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
            setError(getErrorMessage(err, '导出失败'));
        } finally {
            setExporting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader
                title="导出隐患分类统计"
                subtitle="按时间区间与类别导出本企业隐患排查分类统计表"
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
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="开始日期">
                            <DatePicker
                                value={startTime}
                                onChange={setStartTime}
                            />
                        </Field>
                        <Field label="结束日期">
                            <DatePicker
                                value={endTime}
                                onChange={setEndTime}
                            />
                        </Field>
                    </div>
                    <Field label="隐患类别">
                        <select
                            className={selectCls}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="all" className="bg-[#0d1530]">
                                全部类别
                            </option>
                            {HAZARD_STATS_TYPES.map((t) => (
                                <option
                                    key={t}
                                    value={t}
                                    className="bg-[#0d1530]"
                                >
                                    {t}
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
                    disabled={exporting}
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/30 disabled:pointer-events-none disabled:opacity-50"
                >
                    {exporting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <BarChart3 className="h-3.5 w-3.5" />
                    )}
                    导出
                </button>
            </div>
        </Modal>
    );
}
