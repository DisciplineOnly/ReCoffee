import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import { CheckoutProvider, useCheckout } from '../contexts/CheckoutContext';
import StepIndicator from '../components/checkout/StepIndicator';
import ClientInfoStep from '../components/checkout/ClientInfoStep';
import DeliveryStep from '../components/checkout/DeliveryStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';

function CheckoutContent() {
    const { t } = useTranslation();
    const { cart } = useCart();
    const { currentStep } = useCheckout();

    // Redirect to cart if empty
    if (cart.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    const steps = [
        { title: t('checkout.client_info') },
        { title: t('checkout.delivery_details') },
        { title: t('checkout.payment_method') },
        { title: t('checkout.review_order') }
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <ClientInfoStep />;
            case 2:
                return <DeliveryStep />;
            case 3:
                return <PaymentStep />;
            case 4:
                return <ReviewStep />;
            default:
                return <ClientInfoStep />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F4F2] py-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
                        {t('checkout.title')}
                    </h1>
                </div>

                <StepIndicator currentStep={currentStep} steps={steps} />

                <div className="mt-12">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    return (
        <CheckoutProvider>
            <CheckoutContent />
        </CheckoutProvider>
    );
}
