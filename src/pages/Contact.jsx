import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Building2, Check } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { siteConfig } from '../lib/siteConfig';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Contact() {
    const { t } = useTranslation();
    useSEO({
        title: t('contact.title'),
        description: `Свържи се с ReCoffee — ${siteConfig.address}. ${siteConfig.phone}, ${siteConfig.email}.`,
    });

    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = t('forms.required_field');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = t('forms.invalid_email');
        if (!form.message.trim()) newErrors.message = t('forms.required_field');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('loading');
        const { error } = await supabase.from('inquiries').insert({
            type: 'contact',
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim() || null,
            message: form.message.trim(),
        });
        if (error) {
            console.error('Contact inquiry failed:', error);
            setStatus('error');
        } else {
            setStatus('success');
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    const details = [
        { icon: Mail, label: t('contact.email_label'), value: siteConfig.email, href: `mailto:${siteConfig.email}` },
        { icon: Phone, label: t('contact.phone_label'), value: siteConfig.phone, href: siteConfig.phoneHref },
        { icon: MapPin, label: t('contact.address_label'), value: siteConfig.address },
        { icon: Clock, label: t('contact.hours_label'), value: siteConfig.workingHours },
        { icon: Building2, label: t('contact.vat_label'), value: `${siteConfig.legalName} · ${siteConfig.vatNumber}` },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-24 animate-in fade-in duration-700">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('contact.badge')} title={t('contact.title')} intro={t('contact.intro')} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Company Details */}
                    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100 h-fit">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 mb-8">
                            {t('contact.company_details')}
                        </h2>
                        <ul className="space-y-6">
                            {details.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.label} className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">{item.label}</p>
                                            {item.href ? (
                                                <a href={item.href} className="text-sm font-medium text-slate-900 hover:text-brand-primary transition-colors">{item.value}</a>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900">{item.value}</p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">{siteConfig.orderCutoff}</p>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100">
                        {status === 'success' ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-900 mb-3">{t('contact.success_title')}</h3>
                                <p className="text-slate-500">{t('contact.success_message')}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 mb-8">
                                    {t('contact.form_title')}
                                </h2>
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
                                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.message')} *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows="5"
                                            placeholder={t('contact.message_placeholder')}
                                            className={inputClass('message')}
                                        />
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                    </div>
                                    {status === 'error' && (
                                        <p className="text-sm text-red-600">{t('forms.error_generic')}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors rounded-lg disabled:opacity-60 flex items-center justify-center gap-3"
                                    >
                                        {status === 'loading' ? <LoadingSpinner size="sm" color="white" /> : t('contact.submit')}
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
