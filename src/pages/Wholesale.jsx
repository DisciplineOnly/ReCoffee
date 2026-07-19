import React, { useState } from 'react';
import { Store, Briefcase, Coffee, Package, Check } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { siteConfig } from '../lib/siteConfig';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Wholesale() {
    const { t } = useTranslation();
    useSEO({
        title: t('wholesale.title'),
        description: 'B2B партньорство с ReCoffee — кафе за кафенета, ресторанти, офиси и вендинг. Обучение, оборудване и собствена марка.',
    });

    const segments = [
        { id: 'horeca', icon: Store, title: t('wholesale.horeca_title'), desc: t('wholesale.horeca_desc') },
        { id: 'office', icon: Briefcase, title: t('wholesale.office_title'), desc: t('wholesale.office_desc') },
        { id: 'vending', icon: Coffee, title: t('wholesale.vending_title'), desc: t('wholesale.vending_desc') },
        { id: 'private', icon: Package, title: t('wholesale.private_title'), desc: t('wholesale.private_desc') },
    ];

    const segmentOptions = [
        { id: 'horeca', label: t('wholesale.segment_horeca') },
        { id: 'office', label: t('wholesale.segment_office') },
        { id: 'vending', label: t('wholesale.segment_vending') },
        { id: 'private', label: t('wholesale.segment_private') },
        { id: 'other', label: t('wholesale.segment_other') },
    ];

    const whys = [t('wholesale.why_1'), t('wholesale.why_2'), t('wholesale.why_3'), t('wholesale.why_4')];

    const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', segment: 'horeca', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = t('forms.required_field');
        if (!form.company.trim()) newErrors.company = t('forms.required_field');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = t('forms.invalid_email');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('loading');
        const { error } = await supabase.from('inquiries').insert({
            type: 'b2b',
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim() || null,
            message: form.message.trim() || null,
            details: { segment: form.segment },
        });
        if (error) {
            console.error('B2B inquiry failed:', error);
            setStatus('error');
        } else {
            setStatus('success');
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('wholesale.badge')} title={t('wholesale.title')} intro={t('wholesale.intro')} />

                {/* Segments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {segments.map((segment) => {
                        const Icon = segment.icon;
                        return (
                            <div key={segment.id} className="bg-[#F6F4F2] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary mb-5">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-serif text-2xl text-slate-900 mb-3">{segment.title}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{segment.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Why + Form */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <h2 className="font-serif text-3xl text-slate-900 mb-8">{t('wholesale.why_title')}</h2>
                        <ul className="space-y-4 mb-10">
                            {whys.map((why, index) => (
                                <li key={index} className="flex items-center gap-3 text-slate-600">
                                    <span className="w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-brand-primary" />
                                    </span>
                                    {why}
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm text-slate-400">
                            {t('contact.email_label')}: <a href={`mailto:${siteConfig.wholesaleEmail}`} className="text-brand-primary hover:underline">{siteConfig.wholesaleEmail}</a>
                            <br />
                            {t('contact.phone_label')}: <a href={siteConfig.phoneHref} className="text-brand-primary hover:underline">{siteConfig.phone}</a>
                        </p>
                    </div>

                    <div className="lg:col-span-3 bg-[#F8F9FA] rounded-2xl p-8 md:p-10 border border-slate-100">
                        {status === 'success' ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-900 mb-3">{t('wholesale.success_title')}</h3>
                                <p className="text-slate-500">{t('wholesale.success_message')}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="font-serif text-2xl text-slate-900 mb-3">{t('wholesale.form_title')}</h2>
                                <p className="text-sm text-slate-500 font-light mb-8">{t('wholesale.form_intro')}</p>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('forms.name')} *</label>
                                            <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass('name')} />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('wholesale.company')} *</label>
                                            <input type="text" name="company" value={form.company} onChange={handleChange} className={inputClass('company')} />
                                            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                                        </div>
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
                                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('wholesale.segment')} *</label>
                                        <select name="segment" value={form.segment} onChange={handleChange} className={`${inputClass('segment')} bg-white`}>
                                            {segmentOptions.map(option => (
                                                <option key={option.id} value={option.id}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.message')}</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder={t('wholesale.message_placeholder')}
                                            className={inputClass('message')}
                                        />
                                    </div>
                                    {status === 'error' && <p className="text-sm text-red-600">{t('forms.error_generic')}</p>}
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors rounded-lg disabled:opacity-60 flex items-center justify-center gap-3"
                                    >
                                        {status === 'loading' ? <LoadingSpinner size="sm" color="white" /> : t('wholesale.submit')}
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
