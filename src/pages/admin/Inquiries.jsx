import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { formatPrice } from '../../lib/price';
import { subscriptionPriceForQuantity } from '../../lib/subscription';

// DB enum values — only their labels are translated, never the stored value.
const TYPES = ['contact', 'b2b', 'subscription'];
const STATUSES = ['new', 'in_progress', 'closed'];

const TYPE_STYLES = {
    contact: 'bg-slate-100 text-slate-600',
    b2b: 'bg-blue-50 text-blue-700',
    subscription: 'bg-purple-50 text-purple-700',
};

const STATUS_STYLES = {
    new: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    closed: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const { t } = useTranslation();

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Failed to load inquiries:', error);
            // Stored as a key, not a message: `t` is a fresh function each
            // render, so depending on it here would re-run the fetch forever.
            setError('admin.inquiries.load_error');
        } else {
            setInquiries(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const updateStatus = async (id, status) => {
        const previous = inquiries;
        setInquiries(prev => prev.map(inquiry => inquiry.id === id ? { ...inquiry, status } : inquiry));
        const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
        if (error) {
            console.error('Failed to update inquiry status:', error);
            alert(t('admin.inquiries.status_error') + error.message);
            setInquiries(previous);
        }
    };

    const visible = typeFilter === 'all'
        ? inquiries
        : inquiries.filter(inquiry => inquiry.type === typeFilter);

    if (loading) return <div className="p-12 text-center text-slate-400">{t('admin.inquiries.loading')}</div>;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">{t('admin.inquiries.title')}</h1>
                    <p className="text-slate-500">{t('admin.inquiries.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                        <option value="all">{t('admin.inquiries.all_types')}</option>
                        {TYPES.map(type => (
                            <option key={type} value={type}>{t(`admin.inquiries.type.${type}`)}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchInquiries}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm text-slate-600 hover:text-slate-900 transition"
                    >
                        <RefreshCw size={16} />
                        {t('admin.refresh')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{t(error)}</div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">{t('admin.inquiries.col_date')}</th>
                            <th className="px-6 py-4">{t('admin.inquiries.col_type')}</th>
                            <th className="px-6 py-4">{t('admin.inquiries.col_from')}</th>
                            <th className="px-6 py-4">{t('admin.inquiries.col_status')}</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">{t('admin.inquiries.empty')}</td>
                            </tr>
                        )}
                        {visible.map((inquiry) => {
                            const isExpanded = expandedId === inquiry.id;
                            return (
                                <React.Fragment key={inquiry.id}>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {new Date(inquiry.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${TYPE_STYLES[inquiry.type] || TYPE_STYLES.contact}`}>
                                                {t(`admin.inquiries.type.${inquiry.type}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {inquiry.name}
                                                {inquiry.company ? ` · ${inquiry.company}` : ''}
                                            </div>
                                            <div className="text-xs text-slate-400">{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={inquiry.status}
                                                onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full border text-xs font-bold outline-none cursor-pointer ${STATUS_STYLES[inquiry.status] || ''}`}
                                            >
                                                {STATUSES.map(status => (
                                                    <option key={status} value={status}>{t(`admin.inquiries.status.${status}`)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                                                className="text-slate-400 hover:text-slate-900 transition"
                                                aria-label={isExpanded ? t('admin.collapse') : t('admin.expand')}
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50/70 border-b border-slate-100">
                                            <td colSpan={5} className="px-6 py-5">
                                                {inquiry.message && (
                                                    <p className="text-slate-700 whitespace-pre-wrap mb-3">{inquiry.message}</p>
                                                )}
                                                {inquiry.type === 'subscription' ? (
                                                    // The price is computed here from the stored
                                                    // quantity, never read out of `details`. The
                                                    // requester chooses a plan; the shop decides
                                                    // what that plan costs.
                                                    <dl className="text-xs bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                                                        <div className="flex gap-2">
                                                            <dt className="text-slate-400 w-32">{t('admin.inquiries.plan_frequency')}</dt>
                                                            <dd className="text-slate-700">{inquiry.details?.frequency || '—'}</dd>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <dt className="text-slate-400 w-32">{t('admin.inquiries.plan_quantity')}</dt>
                                                            <dd className="text-slate-700">{inquiry.details?.quantity || '—'}</dd>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <dt className="text-slate-400 w-32">{t('admin.inquiries.plan_price')}</dt>
                                                            <dd className="text-slate-700">
                                                                {subscriptionPriceForQuantity(inquiry.details?.quantity) !== null
                                                                    ? formatPrice(subscriptionPriceForQuantity(inquiry.details.quantity))
                                                                    : t('admin.inquiries.plan_unknown')}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                ) : inquiry.details && (
                                                    <pre className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
                                                        {JSON.stringify(inquiry.details, null, 2)}
                                                    </pre>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
