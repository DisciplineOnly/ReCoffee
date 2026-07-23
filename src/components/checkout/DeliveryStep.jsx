import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Home, Building } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';

export default function DeliveryStep() {
    const { t } = useTranslation();
    const { checkoutData, updateDeliveryInfo, nextStep, prevStep } = useCheckout();
    const { getCartTotal } = useCart();
    const [errors, setErrors] = useState({});

    const [deliveryType, setDeliveryType] = useState(checkoutData.delivery.type);
    const [address, setAddress] = useState(checkoutData.delivery.address);
    const [courier, setCourier] = useState(checkoutData.delivery.courier || 'econt');
    const [courierCity, setCourierCity] = useState(checkoutData.delivery.courierCity || '');
    const [courierOffice, setCourierOffice] = useState(checkoutData.delivery.courierOffice || '');

    const deliveryFee = getCartTotal() >= 100 ? 0 : 5;

    const validate = () => {
        const newErrors = {};

        if (deliveryType === 'home') {
            if (!address.street.trim()) {
                newErrors.street = t('checkout.required_field');
            }
            if (!address.city.trim()) {
                newErrors.city = t('checkout.required_field');
            }
            if (!address.postalCode.trim()) {
                newErrors.postalCode = t('checkout.required_field');
            }
        } else if (deliveryType === 'office') {
            if (!courierCity.trim()) {
                newErrors.courierCity = t('checkout.required_field');
            }
            if (!courierOffice.trim()) {
                newErrors.courierOffice = t('checkout.required_field');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            updateDeliveryInfo({
                type: deliveryType,
                address: deliveryType === 'home' ? address : {},
                courier: deliveryType === 'office' ? courier : '',
                courierCity: deliveryType === 'office' ? courierCity.trim() : '',
                courierOffice: deliveryType === 'office' ? courierOffice.trim() : ''
            });
            nextStep();
        }
    };

    const handleDeliveryTypeChange = (type) => {
        setDeliveryType(type);
        setErrors({});
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-serif text-slate-900 mb-6">
                    {t('checkout.delivery_details')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Delivery Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            {t('checkout.delivery_method')} *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Home Delivery */}
                            <button
                                type="button"
                                onClick={() => handleDeliveryTypeChange('home')}
                                className={`p-4 border-2 rounded-lg transition-all text-left ${deliveryType === 'home'
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-slate-200 hover:border-brand-primary/50'
                                    }`}
                            >
                                <Home className={`w-6 h-6 mb-2 ${deliveryType === 'home' ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <div className="text-sm font-medium text-slate-900">
                                    {t('checkout.home_delivery')}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {deliveryFee === 0 ? t('cart.free_delivery') : `${deliveryFee} лв`}
                                </div>
                            </button>

                            {/* Office Delivery */}
                            <button
                                type="button"
                                onClick={() => handleDeliveryTypeChange('office')}
                                className={`p-4 border-2 rounded-lg transition-all text-left ${deliveryType === 'office'
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-slate-200 hover:border-brand-primary/50'
                                    }`}
                            >
                                <Building className={`w-6 h-6 mb-2 ${deliveryType === 'office' ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <div className="text-sm font-medium text-slate-900">
                                    {t('checkout.office_delivery')}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {deliveryFee === 0 ? t('cart.free_delivery') : `${deliveryFee} лв`}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Courier Office Fields */}
                    {deliveryType === 'office' && (
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    {t('checkout.courier')} *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'econt', label: t('checkout.courier_econt') },
                                        { id: 'speedy', label: t('checkout.courier_speedy') }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setCourier(option.id)}
                                            className={`p-4 border-2 rounded-lg transition-all text-center text-sm font-bold ${courier === option.id
                                                ? 'border-brand-primary bg-brand-primary/5 text-slate-900'
                                                : 'border-slate-200 text-slate-500 hover:border-brand-primary/50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('checkout.city')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={courierCity}
                                        onChange={(e) => {
                                            setCourierCity(e.target.value);
                                            if (errors.courierCity) setErrors(prev => ({ ...prev, courierCity: '' }));
                                        }}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.courierCity ? 'border-red-500' : 'border-slate-300'}`}
                                    />
                                    {errors.courierCity && (
                                        <p className="mt-1 text-sm text-red-600">{errors.courierCity}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('checkout.courier_office')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={courierOffice}
                                        onChange={(e) => {
                                            setCourierOffice(e.target.value);
                                            if (errors.courierOffice) setErrors(prev => ({ ...prev, courierOffice: '' }));
                                        }}
                                        placeholder={t('checkout.courier_office_placeholder')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.courierOffice ? 'border-red-500' : 'border-slate-300'}`}
                                    />
                                    {errors.courierOffice && (
                                        <p className="mt-1 text-sm text-red-600">{errors.courierOffice}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address Fields (home delivery) */}
                    {deliveryType === 'home' && (
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('checkout.street_address')} *
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.street ? 'border-red-500' : 'border-slate-300'
                                        }`}
                                />
                                {errors.street && (
                                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('checkout.city')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.city ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('checkout.postal_code')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={address.postalCode}
                                        onChange={handleAddressChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.postalCode ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                    />
                                    {errors.postalCode && (
                                        <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('checkout.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={address.notes}
                                    onChange={handleAddressChange}
                                    rows="3"
                                    placeholder={t('checkout.delivery_notes_placeholder')}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('checkout.back')}
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
