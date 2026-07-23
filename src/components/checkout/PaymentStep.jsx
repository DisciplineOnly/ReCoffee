import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, Banknote, Building2 } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCheckout } from '../../contexts/CheckoutContext';

export default function PaymentStep() {
    const { t } = useTranslation();
    const { checkoutData, updatePaymentInfo, nextStep, prevStep } = useCheckout();

    const [paymentMethod, setPaymentMethod] = useState(checkoutData.payment.method);
    const [cardType, setCardType] = useState(checkoutData.payment.cardType);

    const handleSubmit = (e) => {
        e.preventDefault();
        updatePaymentInfo({ method: paymentMethod, cardType });
        nextStep();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-serif text-slate-900 mb-6">
                    {t('checkout.payment_method')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        {/* Card Payment */}
                        <div
                            onClick={() => setPaymentMethod('card')}
                            onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('card')}
                            tabIndex={0}
                            role="button"
                            className={`w-full p-6 border-2 rounded-lg transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary ${paymentMethod === 'card'
                                ? 'border-brand-primary bg-brand-primary/5'
                                : 'border-slate-200 hover:border-brand-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <CreditCard className={`w-6 h-6 mt-1 ${paymentMethod === 'card' ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <div className="flex-1">
                                    <div className="text-base font-medium text-slate-900 mb-2">
                                        {t('checkout.card_payment')}
                                    </div>
                                    {paymentMethod === 'card' && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCardType('visa');
                                                }}
                                                className={`px-4 py-2 border-2 rounded text-sm font-medium transition-all ${cardType === 'visa'
                                                    ? 'border-brand-primary bg-brand-primary text-white'
                                                    : 'border-slate-300 text-slate-700 hover:border-brand-primary'
                                                    }`}
                                            >
                                                Visa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCardType('mastercard');
                                                }}
                                                className={`px-4 py-2 border-2 rounded text-sm font-medium transition-all ${cardType === 'mastercard'
                                                    ? 'border-brand-primary bg-brand-primary text-white'
                                                    : 'border-slate-300 text-slate-700 hover:border-brand-primary'
                                                    }`}
                                            >
                                                Mastercard
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cash on Delivery */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`w-full p-6 border-2 rounded-lg transition-all text-left ${paymentMethod === 'cash'
                                ? 'border-brand-primary bg-brand-primary/5'
                                : 'border-slate-200 hover:border-brand-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <Banknote className={`w-6 h-6 mt-1 ${paymentMethod === 'cash' ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <div className="flex-1">
                                    <div className="text-base font-medium text-slate-900">
                                        {t('checkout.cash_on_delivery')}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Плащане при доставка
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Bank Transfer */}
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('bank')}
                            className={`w-full p-6 border-2 rounded-lg transition-all text-left ${paymentMethod === 'bank'
                                ? 'border-brand-primary bg-brand-primary/5'
                                : 'border-slate-200 hover:border-brand-primary/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <Building2 className={`w-6 h-6 mt-1 ${paymentMethod === 'bank' ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <div className="flex-1">
                                    <div className="text-base font-medium text-slate-900">
                                        {t('checkout.bank_transfer')}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Поръчката се потвърждава след плащане
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

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
                            {t('checkout.review_order')}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
