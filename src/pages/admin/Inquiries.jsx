import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

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

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Failed to load inquiries:', error);
            setError('Could not load inquiries. Make sure the latest DB migration is applied.');
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
            alert('Status update failed: ' + error.message);
            setInquiries(previous);
        }
    };

    const visible = typeFilter === 'all'
        ? inquiries
        : inquiries.filter(inquiry => inquiry.type === typeFilter);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading inquiries...</div>;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">Inquiries</h1>
                    <p className="text-slate-500">Contact messages, B2B leads & subscription requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                        <option value="all">All types</option>
                        {TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchInquiries}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm text-slate-600 hover:text-slate-900 transition"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">From</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No inquiries found.</td>
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
                                                {inquiry.type}
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
                                                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                                                className="text-slate-400 hover:text-slate-900 transition"
                                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
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
                                                {inquiry.details && (
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
