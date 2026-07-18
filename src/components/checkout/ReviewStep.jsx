import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

export default function ReviewStep() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { checkoutData, goToStep, resetCheckout } = useCheckout();
    const { cart, getCartTotal, getDeliveryFee, getGrandTotal, clearCart } = useCart();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = getCartTotal();
    const delivery = getDeliveryFee();
    const total = getGrandTotal();

    const getGrindTypeLabel = (grindType) => {
        const grindTypes = {
            'whole-bean': t('product.whole_bean'),
            'espresso': t('product.espresso'),
            'filter': t('product.filter'),
            'french-press': t('product.french_press')
        };
        return grindTypes[grindType] || grindType;
    };

    const getDeliveryTypeLabel = (type) => {
        const types = {
            'home': t('checkout.home_delivery'),
            'office': t('checkout.office_delivery'),
            'pickup': t('checkout.pickup')
        };
        return types[type] || type;
    };

    const getCourierLabel = (courier) => {
        const couriers = {
            'econt': t('checkout.courier_econt'),
            'speedy': t('checkout.courier_speedy')
        };
        return couriers[courier] || courier;
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            'card': t('checkout.card_payment'),
            'cash': t('checkout.cash_on_delivery'),
            'bank': t('checkout.bank_transfer')
        };
        return methods[method] || method;
    };

    const generateOrderNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `RC-${year}-${random}`;
    };

    const handlePlaceOrder = async () => {
        if (!termsAccepted) {
            alert(t('checkout.terms_alert'));
            return;
        }

        setIsSubmitting(true);

        try {
            // Generate order number
            const orderNumber = generateOrderNumber();

            // Attach the order to the customer account, if logged in
            const { data: { session } } = await supabase.auth.getSession();

            const orderPayload = {
                order_number: orderNumber,
                status: 'pending',
                subtotal,
                delivery_fee: delivery,
                total,
                client_info: checkoutData.client,
                delivery_info: checkoutData.delivery,
                payment_info: checkoutData.payment,
                user_id: session?.user?.id || null
            };

            // 1. Create Order
            let { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert(orderPayload)
                .select()
                .single();

            // Pre-migration fallback: retry without the new columns if they don't exist yet
            if (orderError && orderError.code === 'PGRST204') {
                const legacyPayload = { ...orderPayload };
                delete legacyPayload.payment_info;
                delete legacyPayload.user_id;
                ({ data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert(legacyPayload)
                    .select()
                    .single());
            }

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                grind_type: item.grindType
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Success!
            // Save minimal order info to display on Success page (since we can't query by ID publicly)
            const successOrder = {
                orderNumber: orderNumber,
                items: cart,
                subtotal: subtotal,
                deliveryFee: delivery,
                total: total,
                date: new Date().toISOString(),
                delivery: checkoutData.delivery, // Required for success page calculation
                client: checkoutData.client
            };

            // We use localStorage just to pass data to the success page securely/temporarily
            localStorage.setItem('recoffee_last_order', JSON.stringify(successOrder));

            clearCart();
            resetCheckout();
            navigate('/checkout/success');

        } catch (error) {
            console.error('Order placement failed:', error);
            alert(t('checkout.order_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-serif text-slate-900 mb-6">
                    {t('checkout.review_order')}
                </h2>

                {/* Client Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.client_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(1)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.firstName} {checkoutData.client.lastName}
                        </p>
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.email}
                        </p>
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.phone}
                        </p>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.delivery_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(2)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {getDeliveryTypeLabel(checkoutData.delivery.type)}
                        </p>
                        {checkoutData.delivery.type === 'pickup' ? (
                            <p className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                {t(`checkout.${checkoutData.delivery.pickupLocation}`)}
                            </p>
                        ) : checkoutData.delivery.type === 'office' ? (
                            <p className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                {getCourierLabel(checkoutData.delivery.courier)} — {checkoutData.delivery.courierOffice}, {checkoutData.delivery.courierCity}
                            </p>
                        ) : (
                            <>
                                <p className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    {checkoutData.delivery.address.street}, {checkoutData.delivery.address.city} {checkoutData.delivery.address.postalCode}
                                </p>
                                {checkoutData.delivery.address.notes && (
                                    <p className="text-xs text-slate-500 ml-6">
                                        {t('checkout.note_label')} {checkoutData.delivery.address.notes}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.payment_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(3)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {getPaymentMethodLabel(checkoutData.payment.method)}
                            {checkoutData.payment.method === 'card' && ` (${checkoutData.payment.cardType.charAt(0).toUpperCase() + checkoutData.payment.cardType.slice(1)})`}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                        {t('checkout.order_summary')}
                    </h3>
                    <div className="space-y-3">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <div>
                                    <span className="text-slate-900 font-medium">{item.product.name}</span>
                                    <span className="text-slate-500 text-xs ml-2">
                                        ({getGrindTypeLabel(item.grindType)}) x{item.quantity}
                                    </span>
                                </div>
                                <span className="text-slate-900 font-medium">
                                    {(item.product.price * item.quantity).toFixed(2)} лв
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{t('cart.subtotal')}</span>
                            <span className="text-slate-900 font-medium">{subtotal.toFixed(2)} лв</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{t('cart.delivery')}</span>
                            <span className={`font-medium ${delivery === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                {delivery === 0 ? t('cart.free_delivery') : `${delivery.toFixed(2)} лв`}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                            <span className="text-slate-900">{t('cart.total')}</span>
                            <span className="text-brand-accent">{total.toFixed(2)} лв</span>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-5 h-5 mt-0.5 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                        />
                        <span className="text-sm text-slate-700">
                            {t('checkout.terms_agree')}
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => goToStep(3)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('checkout.back')}
                    </button>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={!termsAccepted || isSubmitting}
                        className="flex-1 py-3 px-6 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t('checkout.processing') : t('checkout.place_order')}
                    </button>
                </div>
            </div>
        </div>
    );
}
