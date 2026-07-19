import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, LogOut, Check, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { formatBgn } from '../lib/price';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function Account() {
    const { t } = useTranslation();
    useSEO({ title: t('account.title') });

    const [session, setSession] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '' });
    const [formError, setFormError] = useState('');
    const [formNotice, setFormNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setSessionLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Check admin membership (used only to show the admin panel shortcut)
    useEffect(() => {
        if (!session) {
            setIsAdmin(false);
            return;
        }
        supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data }) => setIsAdmin(!!data))
            .catch(() => setIsAdmin(false));
    }, [session]);

    const fetchOrders = useCallback(async () => {
        if (!session) return;
        setOrdersLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, status, total, created_at, order_items(quantity)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
        if (!error && data) {
            setOrders(data);
        }
        setOrdersLoading(false);
    }, [session]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setFormError('');
        setFormNotice('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormNotice('');

        const email = form.email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormError(t('forms.invalid_email'));
            return;
        }
        if (form.password.length < 6) {
            setFormError(t('account.password_min'));
            return;
        }
        if (mode === 'register' && form.password !== form.passwordConfirm) {
            setFormError(t('account.password_mismatch'));
            return;
        }

        setSubmitting(true);
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password: form.password });
            if (error) {
                setFormError(t('account.login_error'));
            }
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password: form.password });
            if (error) {
                setFormError(t('account.register_error'));
            } else if (!data.session) {
                // Email confirmation required
                setFormNotice(t('account.check_email'));
            }
        }
        setSubmitting(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setOrders([]);
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <LoadingSpinner size="lg" color="primary" />
            </div>
        );
    }

    // ============ LOGGED IN ============
    if (session) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
                                <User className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif text-slate-900 font-bold">{t('account.welcome')}!</h1>
                                <p className="text-slate-500 text-sm">{session.user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-primary transition-colors"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {t('account.admin_panel')}
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-3 border-2 border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-red-200 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('account.logout')}
                            </button>
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Package className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                                {t('account.my_orders')}
                            </h2>
                        </div>

                        {ordersLoading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner size="md" color="primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-xl font-serif text-slate-400 mb-2">{t('account.no_orders')}</p>
                                <p className="text-sm text-slate-400 mb-8">{t('account.no_orders_hint')}</p>
                                <Link
                                    to="/shop"
                                    className="inline-block px-8 py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all"
                                >
                                    {t('cart.browse_products')}
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {orders.map((order) => {
                                    const itemCount = (order.order_items || []).reduce((sum, item) => sum + item.quantity, 0);
                                    return (
                                        <div key={order.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{order.order_number}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(order.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {itemCount > 0 && ` · ${t('cart.items_count').replace('{{count}}', itemCount)}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                                                    {t(`account.status_${order.status}`)}
                                                </span>
                                                <span className="font-bold text-slate-900">{formatBgn(Number(order.total))}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ============ LOGGED OUT ============
    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-5xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Benefits */}
                    <div>
                        <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                            {t('account.title')}
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-8 font-bold leading-tight">
                            {t('account.benefits_title')}
                        </h1>
                        <ul className="space-y-4">
                            {[t('account.benefit_1'), t('account.benefit_2'), t('account.benefit_3')].map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3 text-slate-600">
                                    <span className="w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-brand-primary" />
                                    </span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Auth Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10">
                        {/* Tabs */}
                        <div className="flex bg-slate-50 rounded-xl p-1 mb-8">
                            {['login', 'register'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { setMode(tab); setFormError(''); setFormNotice(''); }}
                                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {t(`account.${tab}`)}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('account.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('account.password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('account.password_confirm')}</label>
                                    <input
                                        type="password"
                                        name="passwordConfirm"
                                        value={form.passwordConfirm}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    />
                                </div>
                            )}

                            {formError && <p className="text-sm text-red-600">{formError}</p>}
                            {formNotice && (
                                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">{formNotice}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors rounded-lg disabled:opacity-60 flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <LoadingSpinner size="sm" color="white" />
                                ) : (
                                    mode === 'login' ? t('account.login_button') : t('account.register_button')
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-400">
                            {mode === 'login' ? t('account.no_account') : t('account.have_account')}{' '}
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setFormError(''); setFormNotice(''); }}
                                className="text-brand-primary font-bold hover:underline"
                            >
                                {mode === 'login' ? t('account.register') : t('account.login')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
