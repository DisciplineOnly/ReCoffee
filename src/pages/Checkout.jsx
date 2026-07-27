import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import { CheckoutProvider, useCheckout } from '../contexts/CheckoutContext';
import StepIndicator from '../components/checkout/StepIndicator';
import ClientInfoStep from '../components/checkout/ClientInfoStep';
import DeliveryStep from '../components/checkout/DeliveryStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';
import { useSEO } from '../hooks/useSEO';

function CheckoutContent() {
    const { t } = useTranslation();
    const { cart, cartLoading, catalogDegraded } = useCart();
    const { currentStep, orderPlaced } = useCheckout();

    useSEO({ title: t('checkout.title'), noindex: true });

    // The order went through and the navigation to the confirmation page is in
    // flight. React Router applies navigate() inside a transition while
    // clearCart() is a normal-priority update, so this component still renders
    // once with an empty cart while the route is /checkout — without this the
    // guard below fired and replaced the pending navigation, dumping the
    // customer on /cart instead of the confirmation. Render nothing rather than
    // flashing an empty checkout for that frame.
    if (orderPlaced) {
        return null;
    }

    // The cart is stored as product ids and joined against the live catalog, so
    // it reads as empty until that fetch lands. Without this the guard below
    // fires on a hard refresh and dumps the customer on /cart — the same
    // failure the lazy initialiser in CartContext was written to prevent, moved
    // one step later by the join.
    if (cartLoading) {
        return null;
    }

    // Redirect to cart if empty
    if (cart.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    // The catalog came from the bundle, not the database, so every price on the
    // screen is whatever was true at build time and stock is unknown. place_order()
    // would reject these lines anyway — the local catalog's ids are not uuids —
    // but a customer should be told before filling in three steps of forms, not
    // by a generic failure at the end. Not a redirect: /cart is what links here,
    // so bouncing back would look like the button is broken.
    if (catalogDegraded) {
        return (
            <div className="min-h-screen bg-[#F6F4F2] pt-12 pb-24">
                <div className="max-w-2xl mx-auto px-6 md:px-12">
                    <div className="bg-white rounded-lg p-8 md:p-10 text-center">
                        <AlertTriangle className="w-10 h-10 text-brand-primary mx-auto mb-5" aria-hidden="true" />
                        <h1 className="text-2xl md:text-3xl font-serif text-slate-900 mb-3">
                            {t('checkout.degraded_title')}
                        </h1>
                        <p className="text-slate-600 mb-8">
                            {t('checkout.degraded_message')}
                        </p>
                        <Link
                            to="/cart"
                            className="inline-block bg-brand-primary text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                        >
                            {t('checkout.back_to_cart')}
                        </Link>
                    </div>
                </div>
            </div>
        );
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
        <div className="min-h-screen bg-[#F6F4F2] pt-12 pb-24">
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
