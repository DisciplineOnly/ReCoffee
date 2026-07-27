import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronDown, ChevronUp, RefreshCw, UserX } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

// DB enum values — only their labels are translated, never the stored value.
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Stable tokens raised by erase_order_pii(); the human text is in the locale
// files. Anything unrecognised falls back to the generic message rather than
// showing a raw Postgres error.
const ERASE_ERROR_KEYS = {
    ERASE_ORDER_ACTIVE: 'admin.orders.erase_active',
    ERASE_NOT_PERMITTED: 'admin.orders.erase_denied',
    ERASE_ORDER_NOT_FOUND: 'admin.orders.erase_error',
};

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const { t } = useTranslation();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(id, quantity, unit_price, grind_type, product_name, products(name_bg))')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Failed to load orders:', error);
            // Stored as a key, not a message: `t` is a fresh function each
            // render, so depending on it here would re-run the fetch forever.
            setError('admin.orders.load_error');
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateStatus = async (orderId, status) => {
        const previous = orders;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        // `updated_at` is set by a BEFORE UPDATE trigger, not from here. A
        // client-supplied timestamp is both unnecessary and untrustworthy — it
        // is the browser's clock, and it only ever moved on this one code path,
        // which is why the column could not be believed before.
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) {
            console.error('Failed to update order status:', error);
            alert(t('admin.orders.status_error') + error.message);
            setOrders(previous);
        }
    };

    // GDPR erasure. Deliberately not a delete: the privacy policy keeps order
    // records for the statutory accounting period and removes the person from
    // them instead. erase_order_pii() enforces both that and the admin check —
    // this is the button, not the control.
    const eraseClientData = async (order) => {
        if (!window.confirm(t('admin.orders.confirm_erase').replace('{{order}}', order.order_number))) return;

        const { error } = await supabase.rpc('erase_order_pii', { p_order_id: order.id });
        if (error) {
            console.error('Failed to erase order PII:', error);
            alert(t(ERASE_ERROR_KEYS[error.message] || 'admin.orders.erase_error'));
            return;
        }
        fetchOrders();
    };

    const visibleOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const describeDelivery = (order) => {
        const info = order.delivery_info || {};
        if (info.type === 'office') {
            return t('admin.orders.delivery_office')
                .replace('{{courier}}', (info.courier || '').toUpperCase())
                .replace('{{office}}', info.courierOffice || '')
                .replace('{{city}}', info.courierCity || '');
        }
        const address = info.address || {};
        return t('admin.orders.delivery_address')
            .replace('{{street}}', address.street || '')
            .replace('{{postalCode}}', address.postalCode || '')
            .replace('{{city}}', address.city || '');
    };

    if (loading) return <div className="p-12 text-center text-slate-400">{t('admin.orders.loading')}</div>;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">{t('admin.orders.title')}</h1>
                    <p className="text-slate-500">{t('admin.orders.total_count').replace('{{count}}', orders.length)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                        <option value="all">{t('admin.orders.all_statuses')}</option>
                        {STATUSES.map(status => (
                            <option key={status} value={status}>{t(`admin.orders.status.${status}`)}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchOrders}
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
                            <th className="px-6 py-4">{t('admin.orders.col_order')}</th>
                            <th className="px-6 py-4">{t('admin.orders.col_date')}</th>
                            <th className="px-6 py-4">{t('admin.orders.col_client')}</th>
                            <th className="px-6 py-4">{t('admin.orders.col_total')}</th>
                            <th className="px-6 py-4">{t('admin.orders.col_status')}</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t('admin.orders.empty')}</td>
                            </tr>
                        )}
                        {visibleOrders.map((order) => {
                            const client = order.client_info || {};
                            const isExpanded = expandedId === order.id;
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 font-mono font-medium text-slate-900">{order.order_number}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.pii_erased_at ? (
                                                <span className="text-xs italic text-slate-400">{t('admin.orders.erased_label')}</span>
                                            ) : (
                                                <>
                                                    <div className="font-medium text-slate-900">{client.firstName} {client.lastName}</div>
                                                    <div className="text-xs text-slate-400">{client.email}</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{Number(order.total).toFixed(2)} лв</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full border text-xs font-bold outline-none cursor-pointer ${STATUS_STYLES[order.status] || ''}`}
                                            >
                                                {STATUSES.map(status => (
                                                    <option key={status} value={status}>{t(`admin.orders.status.${status}`)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                className="text-slate-400 hover:text-slate-900 transition"
                                                aria-label={isExpanded ? t('admin.collapse') : t('admin.expand')}
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50/70 border-b border-slate-100">
                                            <td colSpan={6} className="px-6 py-5">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    <div>
                                                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{t('admin.orders.items')}</h4>
                                                        <ul className="space-y-1.5">
                                                            {(order.order_items || []).map(item => (
                                                                <li key={item.id} className="flex justify-between gap-4">
                                                                    <span className="text-slate-700">
                                                                        {item.quantity} × {item.product_name || item.products?.name_bg || t('admin.orders.product_fallback')}
                                                                        <span className="text-slate-400"> ({item.grind_type})</span>
                                                                    </span>
                                                                    <span className="font-medium text-slate-900">
                                                                        {(item.quantity * Number(item.unit_price)).toFixed(2)} лв
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                                                            {t('admin.orders.totals')
                                                                .replace('{{subtotal}}', Number(order.subtotal).toFixed(2))
                                                                .replace('{{delivery}}', Number(order.delivery_fee).toFixed(2))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{t('admin.orders.delivery')}</h4>
                                                        <p className="text-slate-700">{describeDelivery(order)}</p>
                                                        {order.delivery_info?.address?.notes && (
                                                            <p className="text-xs text-slate-500 mt-1">{t('admin.orders.note')}{order.delivery_info.address.notes}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{t('admin.orders.contact_payment')}</h4>
                                                        <p className="text-slate-700">{client.phone}</p>
                                                        <p className="text-slate-700">{client.email}</p>
                                                        {order.payment_info?.method && (
                                                            <p className="text-xs text-slate-500 mt-1">{t('admin.orders.payment')}{order.payment_info.method}</p>
                                                        )}

                                                        {order.pii_erased_at ? (
                                                            <p className="mt-4 text-xs text-slate-400 italic">
                                                                {t('admin.orders.erased_on').replace(
                                                                    '{{date}}',
                                                                    new Date(order.pii_erased_at).toLocaleDateString('bg-BG')
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => eraseClientData(order)}
                                                                className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:text-slate-900 transition"
                                                            >
                                                                <UserX size={14} />
                                                                {t('admin.orders.erase')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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
