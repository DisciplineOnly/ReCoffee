import React, { useState } from 'react';
import { CalendarClock, Flame, PackageCheck, Check, Gift } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/price';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SUBSCRIPTION_DISCOUNT = 0.15;

export default function Subscription() {
    const { t } = useTranslation();
    useSEO({
        title: t('subscriptionPage.title'),
        description: 'Кафе на абонамент от ReCoffee — прясно изпечено, с 15% отстъпка и безплатна доставка. Избери честота и количество.',
    });

    const frequencies = [
        { id: 'weekly', label: t('subscriptionPage.plan_weekly') },
        { id: 'biweekly', label: t('subscriptionPage.plan_biweekly') },
        { id: 'monthly', label: t('subscriptionPage.plan_monthly') },
    ];

    const quantities = [
        { id: '250', label: t('subscriptionPage.plan_250'), regularPrice: 17.90 },
        { id: '500', label: t('subscriptionPage.plan_500'), regularPrice: 35.80 },
        { id: '1000', label: t('subscriptionPage.plan_1000'), regularPrice: 71.60 },
    ];

    const steps = [
        { icon: CalendarClock, title: t('subscriptionPage.step1_title'), desc: t('subscriptionPage.step1_desc') },
        { icon: Flame, title: t('subscriptionPage.step2_title'), desc: t('subscriptionPage.step2_desc') },
        { icon: PackageCheck, title: t('subscriptionPage.step3_title'), desc: t('subscriptionPage.step3_desc') },
    ];

    const [frequency, setFrequency] = useState('biweekly');
    const [quantity, setQuantity] = useState('500');
    const [form, setForm] = useState({ name: '', email: '', phone: '', preference: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'

    const subPrice = (regular) => regular * (1 - SUBSCRIPTION_DISCOUNT);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = t('forms.required_field');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = t('forms.invalid_email');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('loading');
        const selectedQuantity = quantities.find(q => q.id === quantity);
        const { error } = await supabase.rpc('submit_inquiry', {
            p_type: 'subscription',
            p_name: form.name.trim(),
            p_email: form.email.trim().toLowerCase(),
            p_phone: form.phone.trim() || null,
            p_message: form.preference.trim() || null,
            p_details: {
                frequency,
                quantity,
                pricePerDelivery: Number(subPrice(selectedQuantity.regularPrice).toFixed(2)),
            },
        });
        if (error) {
            console.error('Subscription request failed:', error);
            setStatus(error.message === 'RATE_LIMITED' ? 'rate_limited' : 'error');
        } else {
            setStatus('success');
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    const optionClass = (selected) =>
        `p-4 border-2 rounded-xl transition-all text-left w-full ${selected ? 'border-brand-primary bg-brand-primary/5 shadow-inner' : 'border-slate-200 hover:border-brand-primary/40'}`;

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                <PageHeader
                    badge={t('subscriptionPage.badge')}
                    title={t('subscriptionPage.title')}
                    intro={t('subscriptionPage.intro')}
                />

                {/* How it works */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="bg-[#F6F4F2] rounded-2xl p-8 text-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary mx-auto mb-5">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-medium text-slate-900 text-sm uppercase tracking-wider mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 font-light">{step.desc}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Plan Picker */}
                    <div>
                        <h2 className="font-serif text-3xl text-slate-900 mb-8">{t('subscriptionPage.plans_title')}</h2>

                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                            {t('subscriptionPage.frequency')}
                        </h3>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {frequencies.map((freq) => (
                                <button key={freq.id} type="button" onClick={() => setFrequency(freq.id)} className={optionClass(frequency === freq.id)}>
                                    <span className="text-sm font-bold text-slate-900">{freq.label}</span>
                                </button>
                            ))}
                        </div>

                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                            {t('subscriptionPage.quantity')}
                        </h3>
                        <div className="space-y-3">
                            {quantities.map((q) => (
                                <button key={q.id} type="button" onClick={() => setQuantity(q.id)} className={optionClass(quantity === q.id)}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-900">{q.label}</span>
                                        <span className="text-right">
                                            <span className="block text-lg font-bold text-brand-primary">
                                                {formatPrice(subPrice(q.regularPrice))}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {t('subscriptionPage.instead_of')} <s>{q.regularPrice.toFixed(2)} лв</s> · {t('subscriptionPage.per_delivery')}
                                            </span>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <p className="mt-6 text-sm text-slate-400 flex items-start gap-2">
                            <Gift className="w-4 h-4 mt-0.5 text-brand-primary flex-shrink-0" />
                            {t('subscriptionPage.gift_note')}
                        </p>
                    </div>

                    {/* Request Form */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-8 md:p-10 border border-slate-100">
                        {status === 'success' ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-900 mb-3">{t('subscriptionPage.success_title')}</h3>
                                <p className="text-slate-500">{t('subscriptionPage.success_message')}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="font-serif text-2xl text-slate-900 mb-3">{t('subscriptionPage.form_title')}</h2>
                                <p className="text-sm text-slate-500 font-light mb-8">{t('subscriptionPage.form_intro')}</p>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('forms.name')} *</label>
                                        <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass('name')} />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('forms.email')} *</label>
                                            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('forms.phone')}</label>
                                            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass('phone')} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('subscriptionPage.preference')}</label>
                                        <textarea
                                            name="preference"
                                            value={form.preference}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder={t('subscriptionPage.preference_placeholder')}
                                            className={inputClass('preference')}
                                        />
                                    </div>
                                    {status === 'error' && <p className="text-sm text-red-600">{t('forms.error_generic')}</p>}
                                    {status === 'rate_limited' && <p className="text-sm text-red-600">{t('forms.error_rate_limited')}</p>}
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors rounded-lg disabled:opacity-60 flex items-center justify-center gap-3"
                                    >
                                        {status === 'loading' ? <LoadingSpinner size="sm" color="white" /> : t('subscriptionPage.submit')}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
