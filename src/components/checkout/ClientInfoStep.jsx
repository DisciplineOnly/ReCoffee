import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCheckout } from '../../contexts/CheckoutContext';

export default function ClientInfoStep() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { checkoutData, updateClientInfo, nextStep } = useCheckout();
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState(checkoutData.client);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePhone = (phone) => {
        const regex = /^(\+359|0)[0-9]{9}$/;
        return regex.test(phone.replace(/\s/g, ''));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('checkout.required_field');
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t('checkout.required_field');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('checkout.required_field');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('checkout.invalid_email');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('checkout.required_field');
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = t('checkout.invalid_phone');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            updateClientInfo(formData);
            nextStep();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-serif text-slate-900 mb-6">
                    {t('checkout.client_info')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('checkout.first_name')} *
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.firstName ? 'border-red-500' : 'border-slate-300'
                                }`}
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('checkout.last_name')} *
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.lastName ? 'border-red-500' : 'border-slate-300'
                                }`}
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('checkout.email')} *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.email ? 'border-red-500' : 'border-slate-300'
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('checkout.phone')} *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+359 888 123 456"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.phone ? 'border-red-500' : 'border-slate-300'
                                }`}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/cart')}
                            className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('checkout.back_to_cart')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-6 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                        >
                            {t('checkout.continue')}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
